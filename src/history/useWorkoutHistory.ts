import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { workoutHistory, type HistorySection } from "./historyQueries";

/**
 * History's month sections. Undefined until the first read, so the empty card does not flash.
 * Re-read each time the screen gains focus, so a Workout finished elsewhere shows on return.
 */
export function useWorkoutHistory(): HistorySection[] | undefined {
  const [sections, setSections] = useState<HistorySection[] | undefined>(undefined);
  useFocusEffect(
    useCallback(() => {
      setSections(workoutHistory());
    }, []),
  );
  return sections;
}
