import { desc, eq, and, inArray } from "drizzle-orm";

import type { Db } from "@/db/client";
import { routines, sets, workoutExercises, workouts } from "@/db/schema";

import type { PastWorkoutExercise } from "./historyRows";

/**
 * Every finished workout of one exercise, across all routines, newest start first, each with its sets.
 * The routine's name is its current one (null when the workout has no routine). A workout in progress is left out.
 * Rows with no done working set are dropped later, by `buildHistoryRows`.
 */
export function exerciseHistory(q: Pick<Db, "select">, exerciseId: number): PastWorkoutExercise[] {
  const past = q
    .select({
      workoutExerciseId: workoutExercises.id,
      startedAt: workouts.startedAt,
      date: workouts.date,
      routineName: routines.name,
      isDeload: workoutExercises.isDeload,
    })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .leftJoin(routines, eq(routines.id, workouts.routineId))
    .where(and(eq(workoutExercises.exerciseId, exerciseId), eq(workouts.inProgress, false)))
    .orderBy(desc(workouts.startedAt), desc(workoutExercises.id))
    .all();
  if (past.length === 0) return [];
  const pastSets = q
    .select()
    .from(sets)
    .where(
      inArray(
        sets.workoutExerciseId,
        past.map((p) => p.workoutExerciseId),
      ),
    )
    .all();
  return past.map((p) => ({ ...p, sets: pastSets.filter((s) => s.workoutExerciseId === p.workoutExerciseId) }));
}
