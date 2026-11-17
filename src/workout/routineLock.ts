/** Shown wherever the lock disables a control. */
export const LOCK_MESSAGE = "Finish or discard your workout first";

/**
 * Whether a routine is locked: only the routine of the workout in progress is. Other routines, and
 * creating a routine, stay allowed. A workout whose routine was deleted (null) locks nothing.
 */
export function isRoutineLocked(inProgress: { routineId: number | null } | null, routineId: number): boolean {
  return inProgress !== null && inProgress.routineId === routineId;
}
