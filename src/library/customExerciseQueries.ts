import { exercises } from "@/db/schema";
import type { SelectInsertDb } from "@/db/client";

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
