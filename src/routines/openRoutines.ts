import { lockedRoutineIds } from "./routineLimit";

/** Pure: the routines that are not Locked, in the order given. Today, Reminders and the Settings note read only these. */
export function openRoutines<T extends { id: number }>(routines: readonly T[], isPro: boolean): T[] {
  return withoutLocked(routines, new Set(lockedRoutineIds(routines.map((r) => r.id), isPro)));
}

/** Pure: the routines whose id is not in `lockedIds`, in the order given. */
export function withoutLocked<T extends { id: number }>(routines: readonly T[], lockedIds: ReadonlySet<number>): T[] {
  return routines.filter((r) => !lockedIds.has(r.id));
}
