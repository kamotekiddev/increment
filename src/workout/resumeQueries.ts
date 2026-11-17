import { router } from "expo-router";
import { useEffect } from "react";

import { findInProgressWorkout } from "./inProgressQueries";
import { lastActivity, shouldAutoOpen } from "./resume";

/** True once this app process has handled its launch, so foregrounding never reopens a workout. */
let handled = false;

/**
 * On a cold launch only: opens the workout in progress when its last saved edit was within 12 hours. The workout opens over Today, so Minimize lands there.
 */
export function useResumeOnLaunch() {
  useEffect(() => {
    if (handled) return;
    try {
      const workout = findInProgressWorkout();
      if (!workout) {
        handled = true;
        return;
      }
      if (shouldAutoOpen(lastActivity(workout), Date.now())) {
        router.push({ pathname: "/workout/[id]", params: { id: String(workout.id) } });
      }
      // Only once the push went through, so a failure gets another try on the next mount.
      handled = true;
    } catch {
      // Resuming is a convenience: the bar above the tab bar still reopens the workout.
    }
  }, []);
}
