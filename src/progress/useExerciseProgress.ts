import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { useStore } from "zustand";

import { useUnit } from "@/settings/useUnit";

import { pickStore } from "./pickStore";
import { defaultExerciseId, exerciseProgress, type ExerciseProgress } from "./progressQueries";

/**
 * Progress for the picked exercise (else the default one) in the lifter's Unit. Undefined until the first read; null when there is
 * nothing to show. Re-read each time the tab gains focus or the Unit changes, so a workout just finished shows.
 */
export function useExerciseProgress(): ExerciseProgress | null | undefined {
  const { unit } = useUnit();
  const picked = useStore(pickStore, (s) => s.exerciseId);
  const [progress, setProgress] = useState<ExerciseProgress | null | undefined>(undefined);
  useFocusEffect(
    useCallback(() => {
      const fallback = defaultExerciseId();
      const id = picked ?? fallback;
      // A picked exercise that is gone falls back to the default one.
      const shown = id === null ? null : (exerciseProgress(id, unit) ?? (fallback === null ? null : exerciseProgress(fallback, unit)));
      setProgress(shown);
    }, [unit, picked]),
  );
  return progress;
}
