import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect } from "react";

import { shouldHoldWakeLock } from "./wakeLock";

const TAG = "live-workout";

/**
 * Call from the live workout screen only. Holds the wake lock while it is mounted and `keepScreenAwake` is on.
 * Activation is async, so a release that lands first (quick unmount, setting toggled off) must be repeated once the
 * activation resolves, or the screen would stay awake outside the workout.
 */
export function useWorkoutWakeLock(keepScreenAwake: boolean): void {
  const hold = shouldHoldWakeLock({ liveWorkoutOpen: true, keepScreenAwake });
  useEffect(() => {
    if (!hold) return;
    let released = false;
    activateKeepAwakeAsync(TAG)
      .then(() => {
        if (released) deactivateKeepAwake(TAG).catch(() => {});
      })
      .catch(() => {});
    return () => {
      released = true;
      deactivateKeepAwake(TAG).catch(() => {});
    };
  }, [hold]);
}
