import { and, asc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { dateLabel, shortDateLabel } from "@/history/historyQueries";
import { exerciseRecords, isCountedSet, workoutRecordTags, type ExerciseRecords, type RecordName } from "@/records/recordsQueries";
import { convert, formatNumber, loggedWeightText, weightKg, type Unit } from "@/units";
import { repsText } from "@/workout/repsText";

/** One exercise in the Progress picker. */
export interface PickerExercise {
  exerciseId: number;
  /** The full library name, the same on the picker and the Records card. */
  name: string;
  equipment: string;
  /** `Thu, 12 Nov`, or null while no finished workout has a done Working set of it ("Not done yet"). */
  lastDoneLabel: string | null;
}

/**
 * The exercises Progress can show: every exercise with a finished workout, most recently done first (the later
 * exercise of one workout first), then the exercises in a routine that were never done, in routine order. One entry
 * per library exercise, so a weighted twin is its own entry. Only counted sets (`isCountedSet`) of finished workouts
 * make an exercise "done", the same rule the hero's top set and the Records use.
 */
export function pickerExercises(): PickerExercise[] {
  const doneRows = db
    .select({
      exerciseId: exercises.id,
      name: exercises.name,
      equipment: exercises.equipment,
      loadType: exercises.loadType,
      weight: sets.weight,
      reps: sets.reps,
      date: workouts.date,
      startedAt: workouts.startedAt,
      workoutId: workouts.id,
      position: workoutExercises.position,
    })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(and(eq(sets.done, true), eq(sets.isWarmup, false), eq(workouts.inProgress, false)))
    .all();

  const latest = new Map<number, (typeof doneRows)[number]>();
  for (const row of doneRows) {
    if (!isCountedSet(row, row.loadType)) continue;
    const best = latest.get(row.exerciseId);
    if (!best || isLater(row, best)) latest.set(row.exerciseId, row);
  }
  const done = [...latest.values()]
    .sort((a, b) => (isLater(a, b) ? -1 : 1))
    .map((row) => ({ exerciseId: row.exerciseId, name: row.name, equipment: row.equipment, lastDoneLabel: dateLabel(row.date) }));

  const routineRows = db
    .select({ exerciseId: exercises.id, name: exercises.name, equipment: exercises.equipment })
    .from(routineExercises)
    .innerJoin(routines, eq(routines.id, routineExercises.routineId))
    .innerJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
    .orderBy(asc(routines.position), asc(routines.id), asc(routineExercises.position))
    .all();
  const seen = new Set(done.map((e) => e.exerciseId));
  const notDone: PickerExercise[] = [];
  for (const row of routineRows) {
    if (seen.has(row.exerciseId)) continue;
    seen.add(row.exerciseId);
    notDone.push({ ...row, lastDoneLabel: null });
  }
  return [...done, ...notDone];
}

function isLater(
  a: { startedAt: number; workoutId: number; position: number },
  b: { startedAt: number; workoutId: number; position: number },
): boolean {
  if (a.startedAt !== b.startedAt) return a.startedAt > b.startedAt;
  if (a.workoutId !== b.workoutId) return a.workoutId > b.workoutId;
  return a.position > b.position;
}

/** The exercise Progress opens on: the most recently done, else the first routine exercise, else null. */
export function defaultExerciseId(): number | null {
  return pickerExercises()[0]?.exerciseId ?? null;
}

/** Two weights within a gram are the same, so float noise from a conversion is never a change. */
const TOLERANCE_KG = 1e-3;

type LoadType = "weighted" | "bodyweight";

interface TopSet {
  workoutId: number;
  date: string;
  weight: number;
  unit: Unit;
  reps: number;
  kg: number;
}

/** The top set of each finished workout with a counted set of the exercise, earliest first (History's order). */
function topSets(exerciseId: number, loadType: LoadType): TopSet[] {
  const rows = db
    .select({ workoutId: workouts.id, date: workouts.date, weight: sets.weight, unit: sets.weightUnit, reps: sets.reps })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(sets.exerciseId, exerciseId), eq(sets.done, true), eq(sets.isWarmup, false), eq(workouts.inProgress, false)))
    .orderBy(asc(workouts.startedAt), asc(workouts.id), asc(workoutExercises.position), asc(sets.idx), asc(sets.id))
    .all();

  const tops = new Map<number, TopSet>();
  for (const row of rows) {
    if (!isCountedSet(row, loadType)) continue;
    const set: TopSet = { ...row, kg: weightKg({ value: row.weight, unit: row.unit }) };
    const top = tops.get(row.workoutId);
    if (!top || beats(set, top, loadType)) tops.set(row.workoutId, set);
  }
  return [...tops.values()];
}

function beats(a: TopSet, b: TopSet, loadType: LoadType): boolean {
  if (loadType === "weighted") {
    if (a.kg > b.kg + TOLERANCE_KG) return true;
    if (b.kg > a.kg + TOLERANCE_KG) return false;
  }
  return a.reps > b.reps;
}

/** The big top set: `62.5 × 8` with `kg` apart (`10 reps` with no unit); `≈` when logged in the other unit. */
export interface HeroTopSet {
  text: string;
  unit: Unit | null;
}

/** The hero card: the last finished workout's top set and how it compares with the workout before. */
export interface Hero {
  /** `Thu, 12 Nov` */
  dateLabel: string;
  topSet: HeroTopSet;
  /** `Thu, 12 Nov · up 2.5 kg since 29 Oct`, or `Thu, 12 Nov · first workout`. */
  line: string;
  /** The last workout set at least one Record (the accent "New record" pill). */
  newRecord: boolean;
}

/** What Progress shows for one exercise in the lifter's unit. */
export interface ExerciseProgress {
  exerciseId: number;
  /** The full library name. */
  name: string;
  equipment: string;
  loadType: LoadType;
  /** Null while the exercise has no finished workout with a counted set. */
  hero: Hero | null;
  /** The Records card rows, in display order; with no finished workout every value is null ("– – –"). */
  records: RecordRow[];
}

/** One row of the Records card. */
export interface RecordRow {
  /** The record's pill name, the key of the workout's record tags. */
  name: RecordName;
  /** The row title: `Estimated 1-rep max` for the `1-rep max` record. */
  label: string;
  /** `62.5 × 8`, `79 kg`, `1,920 kg`, `10 reps`; null for a 1-rep max no counted set can give ("– – –"). */
  value: string | null;
  /** `Thu, 12 Nov`; null with no value. */
  dateLabel: string | null;
  /** The last workout set this record (the small "New" pill). */
  isNew: boolean;
}

/** `1,920`: whole number with thousands commas, without depending on the runtime's Intl data. */
function thousands(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/** The Records card rows of each load type: the record's pill name and its row title, declared once. */
const RECORD_ROWS: Record<LoadType, { name: RecordName; label: string }[]> = {
  weighted: [
    { name: "Heaviest set", label: "Heaviest set" },
    { name: "1-rep max", label: "Estimated 1-rep max" },
    { name: "Most volume", label: "Most volume" },
  ],
  bodyweight: [
    { name: "Most reps in a set", label: "Most reps in a set" },
    { name: "Most reps in a workout", label: "Most reps in a workout" },
  ],
};

type RecordValue = { value: string | null; date: string | null };

/** The rows with their values, in order; a record with no entry in `values` is empty ("– – –"). */
function rowsOf(loadType: LoadType, values: Partial<Record<RecordName, RecordValue>>, newNames: RecordName[]): RecordRow[] {
  return RECORD_ROWS[loadType].map(({ name, label }) => {
    const { value, date } = values[name] ?? { value: null, date: null };
    return { name, label, value, dateLabel: date === null ? null : dateLabel(date), isNew: value !== null && newNames.includes(name) };
  });
}

function recordRows(records: ExerciseRecords, unit: Unit, newNames: RecordName[]): RecordRow[] {
  if (records.loadType === "bodyweight") {
    return rowsOf(
      "bodyweight",
      {
        "Most reps in a set": { value: repsText(records.mostRepsInSet.value), date: records.mostRepsInSet.date },
        "Most reps in a workout": { value: repsText(records.mostRepsInWorkout.value), date: records.mostRepsInWorkout.date },
      },
      newNames,
    );
  }
  const max = records.estimatedOneRepMax;
  return rowsOf(
    "weighted",
    {
      "Heaviest set": { value: records.heaviestSet.text, date: records.heaviestSet.date },
      "1-rep max": { value: max && `${thousands(max.value)} ${unit}`, date: max?.date ?? null },
      "Most volume": { value: `${thousands(records.mostVolume.value)} ${unit}`, date: records.mostVolume.date },
    },
    newNames,
  );
}

/** The rows of an exercise nothing has been done with: every value empty. */
function emptyRecordRows(loadType: LoadType): RecordRow[] {
  return rowsOf(loadType, {}, []);
}

/** The Records the workout set for this exercise, from the records module's tags (never from dates). */
function newRecordNames(workoutId: number, exerciseId: number): RecordName[] {
  const tags = workoutRecordTags(workoutId);
  const ids = db
    .select({ id: workoutExercises.id })
    .from(workoutExercises)
    .where(and(eq(workoutExercises.workoutId, workoutId), eq(workoutExercises.exerciseId, exerciseId)))
    .all();
  return ids.flatMap(({ id }) => tags[id] ?? []);
}

function topSetText(top: TopSet, loadType: LoadType, unit: Unit): HeroTopSet {
  if (loadType === "bodyweight") return { text: repsText(top.reps), unit: null };
  return { text: `${loggedWeightText({ value: top.weight, unit: top.unit }, unit)} × ${top.reps}`, unit };
}

/** The comparison with the workout before: `up 2.5 kg since 29 Oct`, `same as 29 Oct`, `up 2 reps since 29 Oct`. */
function changeText(last: TopSet, prev: TopSet, loadType: LoadType, unit: Unit): string {
  const since = shortDateLabel(prev.date);
  const kgDiff = last.kg - prev.kg;
  if (loadType === "weighted" && Math.abs(kgDiff) > TOLERANCE_KG) {
    // Exact when both sets were logged in the lifter's unit, else one decimal with "≈" (as History shows a set).
    const exact = last.unit === unit && prev.unit === unit;
    const shown = exact
      ? formatNumber(Math.abs(last.weight - prev.weight))
      : `≈${formatNumber(Math.abs(convert(kgDiff, "kg", unit)), 1)}`;
    return `${kgDiff > 0 ? "up" : "down"} ${shown} ${unit} since ${since}`;
  }
  const repDiff = last.reps - prev.reps;
  if (repDiff === 0) return `same as ${since}`;
  return `${repDiff > 0 ? "up" : "down"} ${repsText(Math.abs(repDiff))} since ${since}`;
}

/** Hero of one exercise in `unit`; null for an unknown exercise id. */
export function exerciseProgress(exerciseId: number, unit: Unit): ExerciseProgress | null {
  const exercise = db
    .select({ name: exercises.name, equipment: exercises.equipment, loadType: exercises.loadType })
    .from(exercises)
    .where(eq(exercises.id, exerciseId))
    .get();
  if (!exercise) return null;
  const { loadType } = exercise;

  const tops = topSets(exerciseId, loadType);
  const last = tops[tops.length - 1];
  let hero: Hero | null = null;
  let records = emptyRecordRows(loadType);
  if (last) {
    const prev = tops[tops.length - 2];
    const newNames = newRecordNames(last.workoutId, exerciseId);
    const current = exerciseRecords(exerciseId, unit);
    if (current) records = recordRows(current, unit, newNames);
    hero = {
      dateLabel: dateLabel(last.date),
      topSet: topSetText(last, loadType, unit),
      line: `${dateLabel(last.date)} · ${prev ? changeText(last, prev, loadType, unit) : "first workout"}`,
      newRecord: newNames.length > 0,
    };
  }
  return { exerciseId, ...exercise, hero, records };
}
