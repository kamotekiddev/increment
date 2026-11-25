import { and, asc, countDistinct, eq, inArray, notExists } from "drizzle-orm";

import type { Db, SelectInsertDb } from "@/db/client";
import { exercises, routineExercises, routines, workoutExercises, workouts } from "@/db/schema";
import { refreshReminders } from "@/reminders";

/** What the Delete exercise sheet tells the lifter. */
export interface ExerciseDeleteInfo {
  /** The routines the exercise leaves, in routine order. */
  routineNames: string[];
  /** Finished workouts it was in; they lose these exercises' sets (ADR 0005). */
  workoutCount: number;
  /** In the Workout in progress: Delete is blocked. */
  inProgress: boolean;
}

export function exerciseDeleteInfo(db: SelectInsertDb, exerciseId: number): ExerciseDeleteInfo {
  const routineNames = db
    .select({ name: routines.name })
    .from(routineExercises)
    .innerJoin(routines, eq(routines.id, routineExercises.routineId))
    .where(eq(routineExercises.exerciseId, exerciseId))
    .orderBy(asc(routines.position), asc(routines.id))
    .all()
    .map((r) => r.name);
  const [{ n: workoutCount }] = db
    .select({ n: countDistinct(workoutExercises.workoutId) })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(workoutExercises.exerciseId, exerciseId), eq(workouts.inProgress, false)))
    .all();
  const inProgress =
    db
      .select({ id: workoutExercises.id })
      .from(workoutExercises)
      .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
      .where(and(eq(workoutExercises.exerciseId, exerciseId), eq(workouts.inProgress, true)))
      .limit(1)
      .all().length > 0;
  return { routineNames, workoutCount, inProgress };
}

export type DeleteExerciseResult = "deleted" | "in-progress" | "not-custom";

/**
 * Deletes a custom exercise in one transaction (ADR 0005): the exercise (the database cascades to its routine
 * exercises, workout exercises and sets), then the routine exercises left are renumbered 0..n-1 and every finished
 * workout it was in that now has no workout exercise is deleted. Blocked while the exercise is in the Workout in progress; a library
 * exercise is never deleted. Reminders are refreshed once it is committed.
 */
export function deleteCustomExercise(db: Db, exerciseId: number): DeleteExerciseResult {
  const result = db.transaction((tx): DeleteExerciseResult => {
    const row = tx.select({ isCustom: exercises.isCustom }).from(exercises).where(eq(exercises.id, exerciseId)).get();
    if (!row?.isCustom) return "not-custom";
    if (exerciseDeleteInfo(tx, exerciseId).inProgress) return "in-progress";

    const affected = tx
      .selectDistinct({ routineId: routineExercises.routineId })
      .from(routineExercises)
      .where(eq(routineExercises.exerciseId, exerciseId))
      .all()
      .map((r) => r.routineId);
    const touched = tx
      .selectDistinct({ workoutId: workoutExercises.workoutId })
      .from(workoutExercises)
      .where(eq(workoutExercises.exerciseId, exerciseId))
      .all()
      .map((w) => w.workoutId);
    tx.delete(exercises).where(eq(exercises.id, exerciseId)).run();
    if (affected.length > 0) {
      const rest = tx
        .select({ id: routineExercises.id, routineId: routineExercises.routineId })
        .from(routineExercises)
        .where(inArray(routineExercises.routineId, affected))
        .orderBy(asc(routineExercises.routineId), asc(routineExercises.position), asc(routineExercises.id))
        .all();
      const next = new Map<number, number>();
      for (const r of rest) {
        const position = next.get(r.routineId) ?? 0;
        next.set(r.routineId, position + 1);
        tx.update(routineExercises).set({ position }).where(eq(routineExercises.id, r.id)).run();
      }
    }
    tx.delete(workouts)
      .where(
        and(
          inArray(workouts.id, touched),
          eq(workouts.inProgress, false),
          notExists(tx.select({ id: workoutExercises.id }).from(workoutExercises).where(eq(workoutExercises.workoutId, workouts.id))),
        ),
      )
      .run();
    return "deleted";
  });
  if (result === "deleted") void refreshReminders();
  return result;
}
