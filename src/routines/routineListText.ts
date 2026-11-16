import { daysLabel } from "./routineDays";
import { FREE_ROUTINE_LIMIT } from "./routineLimit";

/** Pure: the muted line under a Routine name, e.g. "Mon · Thu · 5 exercises". */
export function routineSubtitle(days: number, exerciseCount: number): string {
  const exercises =
    exerciseCount === 0 ? "No exercises yet" : `${exerciseCount} ${exerciseCount === 1 ? "exercise" : "exercises"}`;
  return `${daysLabel(days)} · ${exercises}`;
}

/** Pure: the counter above the list, e.g. "1 of 2 routines" (free) or "3 routines" (Pro). */
export function routineCounter(count: number, isPro: boolean): string {
  if (isPro) return `${count} ${count === 1 ? "routine" : "routines"}`;
  return `${count} of ${FREE_ROUTINE_LIMIT} routines`;
}
