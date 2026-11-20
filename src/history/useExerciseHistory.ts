import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { db } from "@/db/client";

import { exerciseHistory } from "./historyQueries";
import type { PastWorkoutExercise } from "./historyRows";

/** The history of one exercise, reloaded each time the screen gains focus so a just-finished workout shows. Null until loaded. */
export function useExerciseHistory(exerciseId: number): PastWorkoutExercise[] | null {
  const [past, setPast] = useState<PastWorkoutExercise[] | null>(null);
  useFocusEffect(
    useCallback(() => {
      setPast(exerciseHistory(db, exerciseId));
    }, [exerciseId]),
  );
  return past;
}
