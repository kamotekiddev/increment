/** Routines the free plan allows. The only place this number lives. */
export const FREE_ROUTINE_LIMIT = 2;

/** Pure: whether the lifter may create one more Routine, given how many exist. */
export function canCreateRoutine(count: number, isPro: boolean): boolean {
  return isPro || count < FREE_ROUTINE_LIMIT;
}

/**
 * Pure: the ids of the Locked routines. The FREE_ROUTINE_LIMIT lowest ids (creation order, ids are
 * never reused) stay open, whatever position the list shows. Worked out on read, never stored.
 */
export function lockedRoutineIds(routineIds: readonly number[], isPro: boolean): number[] {
  if (isPro) return [];
  return [...routineIds].sort((a, b) => a - b).slice(FREE_ROUTINE_LIMIT);
}
