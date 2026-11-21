import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { useUnit } from "@/settings/useUnit";

import { workoutHistory, type HistorySection } from "./historyQueries";

/**
 * History's month sections in the lifter's Unit. Undefined until the first read, so the empty card does not flash.
 * Re-read each time the screen gains focus or the Unit changes, so a Workout finished elsewhere shows on return.
 */
export function useWorkoutHistory(): HistorySection[] | undefined {
  const { unit } = useUnit();
  const [sections, setSections] = useState<HistorySection[] | undefined>(undefined);
  useFocusEffect(
    useCallback(() => {
      setSections(workoutHistory(unit));
    }, [unit]),
  );
  return sections;
}
