/** Whether the screen should be held awake: only while the live workout is open and Keep screen awake is on. */
export function shouldHoldWakeLock({
  liveWorkoutOpen,
  keepScreenAwake,
}: {
  liveWorkoutOpen: boolean;
  keepScreenAwake: boolean;
}): boolean {
  return liveWorkoutOpen && keepScreenAwake;
}
