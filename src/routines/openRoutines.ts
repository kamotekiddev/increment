import { lockedRoutineIds } from "./routineLimit";

/** Pure: the routines that are not Locked, in the order given. Today, Reminders and the Settings note read only these. */
export function openRoutines<T extends { id: number }>(routines: readonly T[], isPro: boolean): T[] {
  const locked = new Set(lockedRoutineIds(routines.map((r) => r.id), isPro));
  return routines.filter((r) => !locked.has(r.id));
}
