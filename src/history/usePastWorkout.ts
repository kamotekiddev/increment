import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { useUnit } from "@/settings/useUnit";

import { pastWorkout, type PastWorkout } from "./historyQueries";

/**
 * One finished Workout in the lifter's Unit. Undefined until the first read; null for an unknown id or a Workout
 * in progress. Re-read each time the screen gains focus or the Unit changes.
 */
export function usePastWorkout(id: number): PastWorkout | null | undefined {
  const { unit } = useUnit();
  const [workout, setWorkout] = useState<PastWorkout | null | undefined>(undefined);
  useFocusEffect(
    useCallback(() => {
      setWorkout(pastWorkout(id, unit));
    }, [id, unit]),
  );
  return workout;
}
