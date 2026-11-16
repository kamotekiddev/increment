/** Routines the free plan allows. The only place this number lives. */
export const FREE_ROUTINE_LIMIT = 2;

/** Pure: whether the lifter may create one more Routine, given how many exist. */
export function canCreateRoutine(count: number, isPro: boolean): boolean {
  return isPro || count < FREE_ROUTINE_LIMIT;
}
