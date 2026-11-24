/**
 * The moments that can show Pro unlocked:
 * - Pro switched on (whatever caused it), with or without the live workout open;
 * - the lifter left the workout screens (Finish's summary closed, Discard, or Minimize);
 * - a cold launch, which may resume a workout in progress.
 */
export type UnlockScreenEvent =
  | { kind: "switched-on"; workoutOpen: boolean }
  | { kind: "workout-closed"; owed: boolean; workoutInProgress: boolean }
  | { kind: "launch"; owed: boolean; workoutResumed: boolean };

/** Whether to show Pro unlocked now, and the `unlock_screen_owed` flag to store afterwards. */
export interface UnlockScreenAction {
  show: boolean;
  owed: boolean;
}

/**
 * Pro unlocked shows once each time Pro switches on, never over a live workout: during one it is owed,
 * and it shows once that workout is over (finished or discarded), or at a later launch that resumes none.
 */
export function unlockScreen(event: UnlockScreenEvent): UnlockScreenAction {
  switch (event.kind) {
    case "switched-on":
      return event.workoutOpen ? { show: false, owed: true } : { show: true, owed: false };
    case "workout-closed":
      // A minimized workout is still in progress: it isn't over yet.
      return owedUnless(event.owed, event.workoutInProgress);
    case "launch":
      return owedUnless(event.owed, event.workoutResumed);
  }
}

/** Shows what is owed, unless a workout still holds it back. */
function owedUnless(owed: boolean, heldBack: boolean): UnlockScreenAction {
  if (!owed) return { show: false, owed: false };
  return heldBack ? { show: false, owed: true } : { show: true, owed: false };
}
