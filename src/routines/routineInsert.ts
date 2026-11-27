import { count, eq } from "drizzle-orm";

import type { SelectInsertDb } from "@/db/client";
import type { OverloadRule } from "@/engine";
import { routineExercises, routines } from "@/db/schema";
import type { Jumps } from "@/units";

import type { ExerciseSetup } from "./routineSetup";

/**
 * The inserts behind `createRoutine` and `addRoutineExercise`, on whatever database or transaction they are given
 * (no global `db`, no reminders refresh), so the onboarding module can create a plan inside its own transaction.
 */

/** Inserts a routine at the end of the list and returns its id. */
export function insertRoutine(q: SelectInsertDb, name: string, days: number): number {
  const [{ n }] = q.select({ n: count() }).from(routines).all();
  return q.insert(routines).values({ name, days, position: n }).returning({ id: routines.id }).get().id;
}

/** Adds an exercise at the end of a routine; false (nothing changed) when it is already there. */
export function insertRoutineExercise(
  q: SelectInsertDb,
  routineId: number,
  exerciseId: number,
  setup: ExerciseSetup,
  jumps: Partial<Jumps> = {},
  rule: OverloadRule,
): boolean {
  const [{ n }] = q.select({ n: count() }).from(routineExercises).where(eq(routineExercises.routineId, routineId)).all();
  const inserted = q
    .insert(routineExercises)
    .values({ routineId, exerciseId, position: n, ...setup, ...jumps, rule })
    .onConflictDoNothing()
    .returning({ id: routineExercises.id })
    .all();
  return inserted.length > 0;
}
