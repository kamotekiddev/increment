import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { useUnit } from "@/settings/useUnit";

import { defaultExerciseId, exerciseProgress, type ExerciseProgress } from "./progressQueries";

/**
 * Progress for the default exercise in the lifter's Unit. Undefined until the first read; null when there is
 * nothing to show. Re-read each time the tab gains focus or the Unit changes, so a workout just finished shows.
 */
export function useExerciseProgress(): ExerciseProgress | null | undefined {
  const { unit } = useUnit();
  const [progress, setProgress] = useState<ExerciseProgress | null | undefined>(undefined);
  useFocusEffect(
    useCallback(() => {
      const id = defaultExerciseId();
      setProgress(id === null ? null : exerciseProgress(id, unit));
    }, [unit]),
  );
  return progress;
}
