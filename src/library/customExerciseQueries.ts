import { and, eq } from "drizzle-orm";

import type { Db, SelectInsertDb } from "@/db/client";
import { exercises, routineExercises, sets } from "@/db/schema";

import type { CustomExerciseRow } from "./customExerciseDraft";
import type { ExerciseNameRef } from "./customExerciseName";

/** Inserts a custom exercise and returns its id. */
export function insertCustomExercise(db: SelectInsertDb, row: CustomExerciseRow): number {
  return db.insert(exercises).values(row).returning({ id: exercises.id }).get().id;
}

/** Every exercise's id and name (library and custom), for the name check. */
export function exerciseNameRefs(db: SelectInsertDb): ExerciseNameRef[] {
  return db.select({ id: exercises.id, name: exercises.name }).from(exercises).all();
}

/** Rewrites a custom exercise's fields in place (its id, routines and history stay). A library exercise is never touched. */
export function updateCustomExercise(db: Pick<Db, "update">, id: number, row: CustomExerciseRow): void {
  db.update(exercises)
    .set({
      name: row.name,
      muscles: row.muscles,
      equipment: row.equipment,
      loadType: row.loadType,
      instructions: row.instructions,
    })
    .where(and(eq(exercises.id, id), eq(exercises.isCustom, true)))
    .run();
}

/**
 * Whether the exercise is "used": in any routine, or with any set row (logged, or pre-filled in a workout in
 * progress). A used exercise can't switch to or from Bodyweight equipment.
 */
export function isExerciseUsed(db: SelectInsertDb, id: number): boolean {
  const inRoutine = db.select({ id: routineExercises.id }).from(routineExercises).where(eq(routineExercises.exerciseId, id)).limit(1).all();
  if (inRoutine.length > 0) return true;
  return db.select({ id: sets.id }).from(sets).where(eq(sets.exerciseId, id)).limit(1).all().length > 0;
}
