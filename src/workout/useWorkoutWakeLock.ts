import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import { useEffect } from "react";

import { shouldHoldWakeLock } from "./wakeLock";

const TAG = "live-workout";

/** Call from the live workout screen only. Holds the wake lock while it is mounted and `keepScreenAwake` is on. */
export function useWorkoutWakeLock(keepScreenAwake: boolean): void {
  const hold = shouldHoldWakeLock({ liveWorkoutOpen: true, keepScreenAwake });
  useEffect(() => {
    if (!hold) return;
    activateKeepAwakeAsync(TAG).catch(() => {});
    return () => {
      deactivateKeepAwake(TAG).catch(() => {});
    };
  }, [hold]);
}
