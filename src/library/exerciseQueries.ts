import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";

import { db } from "@/db/client";
import { exercises } from "@/db/schema";

import type { ExerciseSummary } from "./filterExercises";

export type Exercise = typeof exercises.$inferSelect;

/** Every exercise in the library, loaded once. Empty until the query returns. */
export function useExercises(): ExerciseSummary[] {
  const [rows, setRows] = useState<ExerciseSummary[]>([]);

  useEffect(() => {
    db.select({
      id: exercises.id,
      name: exercises.name,
      muscles: exercises.muscles,
      equipment: exercises.equipment,
    })
      .from(exercises)
      .then(setRows);
  }, []);

  return rows;
}

/** One exercise by id: undefined while loading, null when no exercise has that id. */
export function useExercise(id: number): Exercise | null | undefined {
  const [exercise, setExercise] = useState<Exercise | null | undefined>(undefined);

  useEffect(() => {
    db.select()
      .from(exercises)
      .where(eq(exercises.id, id))
      .then((rows) => setExercise(rows[0] ?? null));
  }, [id]);

  return exercise;
}
