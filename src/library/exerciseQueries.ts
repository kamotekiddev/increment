import { count, eq } from "drizzle-orm";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { db } from "@/db/client";
import { exercises, routineExercises } from "@/db/schema";

import type { ExerciseSummary } from "./filterExercises";

export type Exercise = typeof exercises.$inferSelect;

/** A list row: the summary plus the load type (the routine picker needs it for the default rule). */
export type LibraryExercise = ExerciseSummary & { loadType: Exercise["loadType"]; equipment: string };

/** Every exercise, library and custom, reloaded each time the screen gains focus. Empty until the query returns. */
export function useExercises(): LibraryExercise[] {
  const [rows, setRows] = useState<LibraryExercise[]>([]);

  useFocusEffect(
    useCallback(() => {
      let live = true;
      db.select({
        id: exercises.id,
        name: exercises.name,
        muscles: exercises.muscles,
        loadType: exercises.loadType,
        equipment: exercises.equipment,
      })
        .from(exercises)
        .then((result) => {
          if (live) setRows(result);
        });
      return () => {
        live = false;
      };
    }, []),
  );

  return rows;
}

/**
 * How many routines each exercise is in, by exercise id; exercises in none are absent.
 * Reloaded each time the screen gains focus, so it is current after editing a routine.
 */
export function useRoutineCounts(): ReadonlyMap<number, number> {
  const [counts, setCounts] = useState<ReadonlyMap<number, number>>(new Map());
  useFocusEffect(
    useCallback(() => {
      let live = true;
      // One row per routine and exercise (unique index), so the row count is the routine count.
      db.select({ exerciseId: routineExercises.exerciseId, routines: count() })
        .from(routineExercises)
        .groupBy(routineExercises.exerciseId)
        .then((rows) => {
          if (live) setCounts(new Map(rows.map((r) => [r.exerciseId, r.routines])));
        });
      return () => {
        live = false;
      };
    }, []),
  );
  return counts;
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
