import { and, eq } from "drizzle-orm";

import { db } from "@/db/client";
import { exercises, sets, workoutExercises, workouts } from "@/db/schema";
import { muscleGroupsOf, type MuscleGroup } from "@/library/muscleGroups";
import type { Unit } from "@/units";

import {
  COUNTED_ROW_COLUMNS,
  COUNTED_ROW_ORDER,
  isCountedSet,
  newRecordsIn,
  recordsOfSessions,
  sessionsFromRows,
  type CountedRow,
  type ExerciseRecords,
  type RecordName,
} from "./recordsQueries";

/** One exercise on All records. */
export interface AllRecordsExercise {
  exerciseId: number;
  name: string;
  equipment: string;
  /** The exercise's first broad muscle group (the chip it filters under), or null for none known. */
  muscleGroup: MuscleGroup | null;
  /** `YYYY-MM-DD` of the last finished workout with a counted set of it. */
  lastDoneDate: string;
  records: ExerciseRecords;
  /** The Records the exercise's last finished workout set (the "New" pills), the Progress rule. */
  newRecords: RecordName[];
}

export interface AllRecords {
  /** Every exercise with at least one counted set, most recently done first. */
  exercises: AllRecordsExercise[];
  /** Records that have a value across the listed exercises. */
  recordCount: number;
  /** Records set in their exercise's last workout. */
  newCount: number;
}

/** How many Records an exercise has a value for (a 1-rep max no counted set can give is not one). */
function valuedRecords(records: ExerciseRecords): number {
  if (records.loadType === "bodyweight") return 2;
  return records.estimatedOneRepMax ? 3 : 2;
}

/**
 * All records, in `unit`: every exercise with a counted set of a finished workout (the Records rule), most recently
 * done first, each with its Records and dates, its muscle group and which Records its last workout set, plus the totals
 * for the banner. Exercises never trained, or with no counted set, are left out. Nothing is stored.
 */
export function allRecords(unit: Unit): AllRecords {
  const rows = db
    .select({
      ...COUNTED_ROW_COLUMNS,
      exerciseId: exercises.id,
      name: exercises.name,
      equipment: exercises.equipment,
      muscles: exercises.muscles,
      loadType: exercises.loadType,
      startedAt: workouts.startedAt,
    })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .where(and(eq(sets.done, true), eq(sets.isWarmup, false), eq(workouts.inProgress, false)))
    .orderBy(...COUNTED_ROW_ORDER)
    .all();

  // One query for every exercise: group its rows (already in History's order) and derive everything from them.
  const rowsOf = new Map<number, CountedRow[]>();
  const latest = new Map<number, (typeof rows)[number]>();
  for (const row of rows) {
    if (!isCountedSet(row, row.loadType)) continue;
    const own = rowsOf.get(row.exerciseId);
    if (own) own.push(row);
    else rowsOf.set(row.exerciseId, [row]);
    const best = latest.get(row.exerciseId);
    if (!best || isLater(row, best)) latest.set(row.exerciseId, row);
  }

  const result: AllRecordsExercise[] = [];
  for (const row of [...latest.values()].sort((a, b) => (isLater(a, b) ? -1 : 1))) {
    const sessions = sessionsFromRows(rowsOf.get(row.exerciseId) ?? [], row.loadType);
    const records = recordsOfSessions(sessions, row.loadType, unit);
    if (!records) continue;
    result.push({
      exerciseId: row.exerciseId,
      name: row.name,
      equipment: row.equipment,
      muscleGroup: muscleGroupsOf(row.muscles)[0] ?? null,
      lastDoneDate: row.date,
      records,
      newRecords: newRecordsIn(sessions, row.workoutId, row.loadType)?.tags ?? [],
    });
  }
  return {
    exercises: result,
    recordCount: result.reduce((n, e) => n + valuedRecords(e.records), 0),
    newCount: result.reduce((n, e) => n + e.newRecords.length, 0),
  };
}

function isLater(
  a: { startedAt: number; workoutId: number; position: number },
  b: { startedAt: number; workoutId: number; position: number },
): boolean {
  if (a.startedAt !== b.startedAt) return a.startedAt > b.startedAt;
  if (a.workoutId !== b.workoutId) return a.workoutId > b.workoutId;
  return a.position > b.position;
}
