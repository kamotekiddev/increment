/** Shown wherever the lock disables a control. */
export const LOCK_MESSAGE = "Finish or discard your workout first";

/**
 * Whether a routine is blocked by a Workout in progress (not the Pro lock): only the routine of the workout in progress is.
 * Other routines, and
 * creating a routine, stay allowed. A workout whose routine was deleted (null) blocks nothing.
 */
export function isBlockedByWorkout(
  inProgress: { routineId: number | null } | null,
  routineId: number,
): boolean {
  return inProgress !== null && inProgress.routineId === routineId;
}
