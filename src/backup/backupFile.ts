import { parseOverloadRule } from "../engine";
import type { OverloadRule } from "../engine/types";
import { SETUP_LIMITS } from "../routines/routineSetup";
import type { exercises, routineExercises, routines, sets, userSettings, workoutExercises, workouts } from "../db/schema";

/**
 * The `.increment` backup file: plain JSON, pure functions only (no database, no React, no I/O).
 * This is the one place that knows the file format. See `docs/architecture.md` ("Backup file").
 *
 * What travels: routines, their exercises, Custom exercises (full rows), finished Workouts with their exercises
 * and sets, and `user_settings`. What never does: `entitlements` (the store decides Pro, ADR 0004), the Last backup
 * date, the settings key/value table, a Workout in progress, and any stored record (records are derived).
 * Library exercises are seeded on every phone, so rows point at them by `slug` (`library_exercises`) rather than
 * trusting that autoincrement ids match across phones.
 * Every set carries `weight` and `weight_unit` exactly as typed (ADR 0003).
 */

/** The format version this build writes and reads natively. A version bump needs a matching `MIGRATIONS` step. */
export const BACKUP_FORMAT_VERSION = 1;
/** Marks the file as an Increment backup. */
export const BACKUP_FORMAT_NAME = "increment-backup";

type Select<T extends { $inferSelect: unknown }> = T["$inferSelect"];

export type ExerciseRow = Select<typeof exercises>;
export type RoutineRow = Select<typeof routines>;
export type RoutineExerciseRow = Select<typeof routineExercises>;
export type WorkoutRow = Select<typeof workouts>;
export type WorkoutExerciseRow = Select<typeof workoutExercises>;
export type SetRow = Select<typeof sets>;
export type UserSettingsRow = Select<typeof userSettings>;

/** The rows `buildBackup` takes: everything on the phone. It does the leaving-out itself. */
export interface BackupSource {
  exercises: ExerciseRow[];
  routines: RoutineRow[];
  routineExercises: RoutineExerciseRow[];
  workouts: WorkoutRow[];
  workoutExercises: WorkoutExerciseRow[];
  sets: SetRow[];
  userSettings: UserSettingsRow | null;
}

/** A library exercise a row points at: the id it had on the phone that made the file, and its stable slug. */
export interface LibraryExerciseRef {
  id: number;
  slug: string;
}

/** A finished Workout: the in-progress flag is never in the file, so a parsed row is always finished. */
export type BackupWorkoutRow = Omit<WorkoutRow, "inProgress" | "finishedAt"> & { finishedAt: number };

/** What `parseBackup` returns, ready for the restore step to insert (ids are the file's, to be remapped). */
export interface BackupData {
  customExercises: ExerciseRow[];
  libraryExercises: LibraryExerciseRef[];
  routines: RoutineRow[];
  routineExercises: RoutineExerciseRow[];
  workouts: BackupWorkoutRow[];
  workoutExercises: WorkoutExerciseRow[];
  sets: SetRow[];
  userSettings: Omit<UserSettingsRow, "id"> | null;
}

export type BackupRefusalReason = "newer_version" | "not_backup" | "cut_off" | "broken_reference";

export const REFUSAL_MESSAGES: Record<BackupRefusalReason, string> = {
  newer_version: "This backup is from a newer Increment. Update the app to restore it.",
  not_backup: "This file isn't a valid Increment backup.",
  cut_off: "This backup file is cut off, so it can't be restored. Try copying it again.",
  broken_reference: "This backup has data that points to something missing, so it can't be restored.",
};

export type ParseResult =
  | { ok: true; data: BackupData; formatVersion: number; exportedAt: number; appVersion: string }
  | { ok: false; reason: BackupRefusalReason; message: string };

/** The numbers the Backup ready and restore preview screens show. */
export interface BackupCounts {
  routines: number;
  customExercises: number;
  workouts: number;
  /** Done working sets (warm-ups and unchecked rows are not counted). */
  sets: number;
}

// ---- Column specs: one table drives build, parse and validation -------------------------------------------------

type Kind = "int" | "real" | "bool" | "text" | "unit" | "loadType" | "strings" | "rule";
interface Col {
  /** Property on the row object. */
  prop: string;
  /** Key in the file (the database column name). */
  key: string;
  kind: Kind;
  nullable: boolean;
}

const c = (prop: string, key: string, kind: Kind, nullable = false): Col => ({ prop, key, kind, nullable });

const EXERCISE_COLS: Col[] = [
  c("id", "id", "int"),
  c("name", "name", "text"),
  c("muscles", "muscles", "strings"),
  c("equipment", "equipment", "text"),
  c("instructions", "instructions", "strings"),
  c("loadType", "load_type", "loadType"),
];
const ROUTINE_COLS: Col[] = [c("id", "id", "int"), c("name", "name", "text"), c("days", "days", "int"), c("position", "position", "int")];
const ROUTINE_EXERCISE_COLS: Col[] = [
  c("id", "id", "int"),
  c("routineId", "routine_id", "int"),
  c("exerciseId", "exercise_id", "int"),
  c("position", "position", "int"),
  c("sets", "sets", "int"),
  c("repMin", "rep_min", "int"),
  c("repMax", "rep_max", "int"),
  c("restS", "rest_s", "int"),
  c("rule", "rule", "rule"),
  c("stepKg", "step_kg", "real", true),
  c("stepLb", "step_lb", "real", true),
];
const WORKOUT_COLS: Col[] = [
  c("id", "id", "int"),
  c("routineId", "routine_id", "int", true),
  c("startedAt", "started_at", "int"),
  c("finishedAt", "finished_at", "int"),
  c("date", "date", "text"),
  c("feeling", "feeling", "int", true),
  c("notes", "notes", "text", true),
  c("lastEditedAt", "last_edited_at", "int", true),
];
const WORKOUT_EXERCISE_COLS: Col[] = [
  c("id", "id", "int"),
  c("workoutId", "workout_id", "int"),
  c("exerciseId", "exercise_id", "int"),
  c("position", "position", "int"),
  c("targetWeightKg", "target_weight_kg", "real", true),
  c("targetReps", "target_reps", "int", true),
  c("targetUnit", "target_unit", "unit", true),
  c("progressAccepted", "progress_accepted", "bool"),
  c("acceptedTargetWeightKg", "accepted_target_weight_kg", "real", true),
  c("acceptedTargetReps", "accepted_target_reps", "int", true),
  c("acceptedTargetUnit", "accepted_target_unit", "unit", true),
  c("isDeload", "is_deload", "bool"),
];
const SET_COLS: Col[] = [
  c("id", "id", "int"),
  c("workoutExerciseId", "workout_exercise_id", "int"),
  c("exerciseId", "exercise_id", "int"),
  c("idx", "idx", "int"),
  c("weight", "weight", "real"),
  c("weightUnit", "weight_unit", "unit"),
  c("reps", "reps", "int"),
  c("done", "done", "bool"),
  c("isWarmup", "is_warmup", "bool"),
  c("edited", "edited", "bool"),
];
const USER_SETTINGS_COLS: Col[] = [
  c("unit", "unit", "unit"),
  c("defaultRestS", "default_rest_s", "int"),
  c("showPreviousSet", "show_previous_set", "bool"),
  c("keepScreenAwake", "keep_screen_awake", "bool"),
  c("remindersOn", "reminders_on", "bool"),
  c("reminderTimeMin", "reminder_time_min", "int"),
];

type Obj = Record<string, unknown>;

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v);

function encode(row: object, cols: Col[]): Obj {
  const out: Obj = {};
  for (const col of cols) out[col.key] = (row as Obj)[col.prop] ?? null;
  return out;
}

function validValue(v: unknown, kind: Kind): boolean {
  switch (kind) {
    case "int":
      return typeof v === "number" && Number.isInteger(v);
    case "real":
      return typeof v === "number" && Number.isFinite(v);
    case "bool":
      return typeof v === "boolean";
    case "text":
      return typeof v === "string";
    case "unit":
      return v === "kg" || v === "lb";
    case "loadType":
      return v === "weighted" || v === "bodyweight";
    case "strings":
      return Array.isArray(v) && v.every((s) => typeof s === "string");
    case "rule":
      return isObj(v);
  }
}

/** Reads one row; undefined when a column is missing or the wrong type. Unknown keys (such as `is_pro`) are dropped. */
function decode<T>(raw: unknown, cols: Col[]): T | undefined {
  if (!isObj(raw)) return undefined;
  const out: Obj = {};
  for (const col of cols) {
    const v = raw[col.key];
    if (v === null || v === undefined) {
      if (!col.nullable) return undefined;
      out[col.prop] = null;
    } else if (validValue(v, col.kind)) {
      out[col.prop] = v;
    } else return undefined;
  }
  return out as T;
}

function decodeAll<T>(raw: unknown, cols: Col[]): T[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: T[] = [];
  for (const r of raw) {
    const row = decode<T>(r, cols);
    if (row === undefined) return undefined;
    out.push(row);
  }
  return out;
}

function decodeLibrary(raw: unknown): LibraryExerciseRef[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: LibraryExerciseRef[] = [];
  for (const r of raw) {
    if (!isObj(r) || typeof r.id !== "number" || !Number.isInteger(r.id) || typeof r.slug !== "string" || r.slug === "") return undefined;
    out.push({ id: r.id, slug: r.slug });
  }
  return out;
}

// ---- Build ------------------------------------------------------------------------------------------------------

export interface BuildOptions {
  exportedAt: number;
  appVersion: string;
}

/**
 * Builds the file's text from every row on the phone. Leaves out library exercises (referenced by slug), Workouts
 * in progress with their exercises and sets, and everything not listed above. Does not change its input.
 */
export function buildBackup(source: BackupSource, options: BuildOptions): string {
  const finished = source.workouts.filter((w) => !w.inProgress && w.finishedAt !== null);
  const finishedIds = new Set(finished.map((w) => w.id));
  const wes = source.workoutExercises.filter((we) => finishedIds.has(we.workoutId));
  const weIds = new Set(wes.map((we) => we.id));
  const setRows = source.sets.filter((s) => weIds.has(s.workoutExerciseId));

  const custom = source.exercises.filter((e) => e.isCustom);
  const used = new Set<number>();
  for (const r of source.routineExercises) used.add(r.exerciseId);
  for (const we of wes) used.add(we.exerciseId);
  for (const s of setRows) used.add(s.exerciseId);
  const library: LibraryExerciseRef[] = source.exercises
    .filter((e) => !e.isCustom && e.slug !== null && used.has(e.id))
    .map((e) => ({ id: e.id, slug: e.slug as string }));

  return JSON.stringify({
    format: BACKUP_FORMAT_NAME,
    format_version: BACKUP_FORMAT_VERSION,
    exported_at: options.exportedAt,
    app_version: options.appVersion,
    library_exercises: library,
    exercises: custom.map((r) => encode(r, EXERCISE_COLS)),
    routines: source.routines.map((r) => encode(r, ROUTINE_COLS)),
    routine_exercises: source.routineExercises.map((r) => encode(r, ROUTINE_EXERCISE_COLS)),
    workouts: finished.map((r) => encode(r, WORKOUT_COLS)),
    workout_exercises: wes.map((r) => encode(r, WORKOUT_EXERCISE_COLS)),
    sets: setRows.map((r) => encode(r, SET_COLS)),
    user_settings: source.userSettings ? encode(source.userSettings, USER_SETTINGS_COLS) : null,
  });
}

/** The file name the share sheet offers, like `Increment backup 14 Nov 2026.increment` (local date). */
export function backupFileName(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `Increment backup ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}.increment`;
}

// ---- Parse ------------------------------------------------------------------------------------------------------

/**
 * Older versions are migrated up one step at a time, each taking the file object of version N and returning N + 1.
 * Empty while 1 is the only version; a bump adds `MIGRATIONS[1]` and so on (rule 5 in docs/agents/rules/data.md).
 */
const MIGRATIONS: Record<number, (file: Obj) => Obj> = {};

function refuse(reason: BackupRefusalReason): ParseResult {
  return { ok: false, reason, message: REFUSAL_MESSAGES[reason] };
}

function uniqueIds(rows: { id: number }[]): Set<number> | undefined {
  const ids = new Set(rows.map((r) => r.id));
  return ids.size === rows.length ? ids : undefined;
}

const MAX_DAYS_MASK = 0b1111111;
const MAX_MINUTE_OF_DAY = 1439;
const MAX_FEELING = 5;

const isDate = (v: string): boolean => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(v);
  if (!m) return false;
  const [y, mo, d] = [Number(m[1]), Number(m[2]), Number(m[3])];
  const date = new Date(Date.UTC(y, mo - 1, d));
  return date.getUTCFullYear() === y && date.getUTCMonth() === mo - 1 && date.getUTCDate() === d;
};
const within = (v: number, min: number, max: number): boolean => v >= min && v <= max;
const nonNeg = (v: number | null): boolean => v === null || v >= 0;

/** The app's own limits (`SETUP_LIMITS`, the days bitmask, the Reminder time), with room for anything the app can save. */
function inRange(
  routineRows: RoutineRow[],
  routineExerciseRows: RoutineExerciseRow[],
  workoutRows: { date: string; feeling: number | null }[],
  workoutExerciseRows: WorkoutExerciseRow[],
  setRows: SetRow[],
  settingsRow: Omit<UserSettingsRow, "id"> | null,
): boolean {
  const L = SETUP_LIMITS;
  return (
    routineRows.every((r) => within(r.days, 0, MAX_DAYS_MASK)) &&
    routineExerciseRows.every(
      (r) =>
        within(r.sets, L.setsMin, L.setsMax) &&
        within(r.repMin, L.repsMin, L.repsMax) &&
        within(r.repMax, L.repsMin, L.repsMax) &&
        r.repMin <= r.repMax &&
        within(r.restS, L.restMinS, L.restMaxS) &&
        nonNeg(r.stepKg) &&
        nonNeg(r.stepLb),
    ) &&
    workoutRows.every((w) => isDate(w.date) && (w.feeling === null || within(w.feeling, 1, MAX_FEELING))) &&
    workoutExerciseRows.every(
      (we) => nonNeg(we.targetWeightKg) && nonNeg(we.targetReps) && nonNeg(we.acceptedTargetWeightKg) && nonNeg(we.acceptedTargetReps),
    ) &&
    setRows.every((s) => s.weight >= 0 && s.reps >= 0) &&
    (settingsRow === null || (settingsRow.defaultRestS >= 0 && within(settingsRow.reminderTimeMin, 0, MAX_MINUTE_OF_DAY)))
  );
}

const hasDuplicate = (keys: string[]): boolean => new Set(keys).size !== keys.length;

/**
 * Reads a backup's text. Checks everything (version, shape, ids, foreign keys) before returning any row, so the
 * caller either gets all of it or a refusal with a plain message. Never throws. Anything the file says about Pro
 * (`entitlements`, `is_pro`, ...) is ignored: only the known columns are read.
 */
export function parseBackup(text: string): ParseResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    // A real backup starts with "{"; a file that does but doesn't parse was cut off or damaged.
    return refuse(text.trimStart().startsWith("{") ? "cut_off" : "not_backup");
  }
  if (!isObj(json) || json.format !== BACKUP_FORMAT_NAME) return refuse("not_backup");

  let version = json.format_version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) return refuse("not_backup");
  if (version > BACKUP_FORMAT_VERSION) return refuse("newer_version");
  let file: Obj = json;
  while (version < BACKUP_FORMAT_VERSION) {
    const step = MIGRATIONS[version];
    if (!step) return refuse("not_backup");
    file = step(file);
    version += 1;
  }

  const exportedAt = file.exported_at;
  const appVersion = file.app_version;
  if (typeof exportedAt !== "number" || !Number.isFinite(exportedAt) || typeof appVersion !== "string") return refuse("not_backup");

  const customRows = decodeAll<Omit<ExerciseRow, "slug" | "isCustom">>(file.exercises, EXERCISE_COLS);
  const routineRows = decodeAll<RoutineRow>(file.routines, ROUTINE_COLS);
  const routineExerciseRows = decodeAll<RoutineExerciseRow>(file.routine_exercises, ROUTINE_EXERCISE_COLS);
  const workoutRows = decodeAll<Omit<WorkoutRow, "inProgress">>(file.workouts, WORKOUT_COLS);
  const workoutExerciseRows = decodeAll<WorkoutExerciseRow>(file.workout_exercises, WORKOUT_EXERCISE_COLS);
  const setRows = decodeAll<SetRow>(file.sets, SET_COLS);
  const library = decodeLibrary(file.library_exercises);
  const userSettingsRow = file.user_settings === null ? null : decode<Omit<UserSettingsRow, "id">>(file.user_settings, USER_SETTINGS_COLS);
  if (
    !customRows || !routineRows || !routineExerciseRows || !workoutRows || !workoutExerciseRows || !setRows ||
    !library || userSettingsRow === undefined
  ) {
    return refuse("not_backup");
  }

  const rules = routineExerciseRows.map((r) => parseOverloadRule(r.rule));
  if (rules.some((r) => r === null) || !inRange(routineRows, routineExerciseRows, workoutRows, workoutExerciseRows, setRows, userSettingsRow)) {
    return refuse("not_backup");
  }

  const customExercises: ExerciseRow[] = customRows.map((e) => ({ ...e, slug: null, isCustom: true }));
  const routineIds = uniqueIds(routineRows);
  const exerciseIds = uniqueIds([...customExercises, ...library]);
  const workoutIds = uniqueIds(workoutRows);
  const weIds = uniqueIds(workoutExerciseRows);
  if (!routineIds || !exerciseIds || !workoutIds || !weIds || !uniqueIds(routineExerciseRows) || !uniqueIds(setRows)) {
    return refuse("broken_reference");
  }

  const intact =
    routineExerciseRows.every((r) => routineIds.has(r.routineId) && exerciseIds.has(r.exerciseId)) &&
    workoutRows.every((w) => w.routineId === null || routineIds.has(w.routineId)) &&
    workoutExerciseRows.every((we) => workoutIds.has(we.workoutId) && exerciseIds.has(we.exerciseId)) &&
    setRows.every((s) => weIds.has(s.workoutExerciseId) && exerciseIds.has(s.exerciseId));
  if (!intact) return refuse("broken_reference");
  if (
    hasDuplicate(routineExerciseRows.map((r) => `${r.routineId}:${r.exerciseId}`)) ||
    hasDuplicate(workoutExerciseRows.map((we) => `${we.workoutId}:${we.exerciseId}:${we.position}`))
  ) {
    return refuse("broken_reference");
  }

  const data: BackupData = {
    customExercises,
    libraryExercises: library,
    routines: routineRows,
    routineExercises: routineExerciseRows.map((r, i) => ({ ...r, rule: rules[i] as OverloadRule })),
    workouts: workoutRows.map((w) => ({ ...w, finishedAt: w.finishedAt as number })),
    workoutExercises: workoutExerciseRows,
    sets: setRows,
    userSettings: userSettingsRow,
  };
  return { ok: true, data, formatVersion: BACKUP_FORMAT_VERSION, exportedAt, appVersion };
}

/** The numbers for Backup ready (from the data just built) and the restore preview (from the parsed file). */
export function backupCounts(data: Pick<BackupData, "routines" | "customExercises" | "workouts" | "sets">): BackupCounts {
  return {
    routines: data.routines.length,
    customExercises: data.customExercises.length,
    workouts: data.workouts.length,
    sets: data.sets.filter((s) => s.done && !s.isWarmup).length,
  };
}
