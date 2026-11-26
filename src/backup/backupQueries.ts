import { and, desc, eq } from "drizzle-orm";

import { db } from "@/db/client";
import {
  exercises,
  routineExercises,
  routines,
  sets,
  settings,
  userSettings,
  workoutExercises,
  workouts,
} from "@/db/schema";
import { allRecords } from "@/records/allRecordsQueries";
import { clampRest } from "@/routines/routineSetup";
import type { Unit } from "@/units";

import { backupCounts, backupFileName, buildBackup, parseBackup, type BackupCounts, type BackupSource } from "./backupFile";
import { settingsSummary } from "./backupText";

/** The `settings` key holding when the last shared backup finished (ms, JSON). Never part of the file. */
const LAST_BACKUP_KEY = "last_backup_at";

/** When the last backup finished sharing (ms), or null if none yet. */
export function readLastBackup(): number | null {
  const row = db.select().from(settings).where(eq(settings.key, LAST_BACKUP_KEY)).get();
  return typeof row?.value === "number" ? row.value : null;
}

/** Stores the Last backup date. Call it only once the share sheet reports the share finished. */
export function writeLastBackup(at: number): void {
  db.insert(settings).values({ key: LAST_BACKUP_KEY, value: at }).onConflictDoUpdate({ target: settings.key, set: { value: at } }).run();
}

/** When the newest finished workout finished (ms), or null if none: a cheap signal that the data changed. */
export function latestFinishedAt(): number | null {
  const row = db
    .select({ at: workouts.finishedAt })
    .from(workouts)
    .where(eq(workouts.inProgress, false))
    .orderBy(desc(workouts.finishedAt))
    .limit(1)
    .get();
  return row?.at ?? null;
}

/** The numbers on the Your data stats card. */
export interface YourDataStats {
  workouts: number;
  sets: number;
  records: number;
}

/** Finished workouts, counted sets (done, not warm-up) of finished workouts, and Records (derived, never stored). */
export function yourDataStats(unit: Unit): YourDataStats {
  const finished = db.select({ id: workouts.id }).from(workouts).where(eq(workouts.inProgress, false)).all().length;
  const counted = db
    .select({ id: sets.id })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(sets.done, true), eq(sets.isWarmup, false), eq(workouts.inProgress, false)))
    .all().length;
  return { workouts: finished, sets: counted, records: allRecords(unit).recordCount };
}

/** Every row on the phone, as `buildBackup` takes them. */
export function readBackupSource(): BackupSource {
  return {
    exercises: db.select().from(exercises).all(),
    routines: db.select().from(routines).all(),
    routineExercises: db.select().from(routineExercises).all(),
    workouts: db.select().from(workouts).all(),
    workoutExercises: db.select().from(workoutExercises).all(),
    sets: db.select().from(sets).all(),
    userSettings: db.select().from(userSettings).get() ?? null,
  };
}

/** A backup built from this phone, ready to be written to a file. */
export interface CreatedBackup {
  fileName: string;
  /** The file's text. */
  text: string;
  counts: BackupCounts & { records: number };
  /** The Settings line of Backup ready, like "kg, 2:30 rest". */
  settingsText: string;
}

/**
 * Builds the backup of this phone's finished data. Read-only: a Workout in progress stays untouched and is left out,
 * and the Last backup date is not touched (it moves only when the share finishes).
 */
export function createBackup(now: number, appVersion: string): CreatedBackup {
  const source = readBackupSource();
  const text = buildBackup(source, { exportedAt: now, appVersion });
  const parsed = parseBackup(text);
  if (!parsed.ok) throw new Error("The backup just built failed its own check.");
  const unit: Unit = source.userSettings?.unit ?? "kg";
  return {
    fileName: backupFileName(new Date(now)),
    text,
    counts: { ...backupCounts(parsed.data), records: allRecords(unit).recordCount },
    settingsText: settingsSummary(unit, clampRest(source.userSettings?.defaultRestS ?? 90)),
  };
}
