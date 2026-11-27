import { daysLabel } from "./routineDays";
import { FREE_ROUTINE_LIMIT } from "./routineLimit";

/** Pure: the muted line under a Routine name, e.g. "Mon · Thu · 5 exercises". */
export function routineSubtitle(days: number, exerciseCount: number): string {
  const exercises =
    exerciseCount === 0 ? "No exercises yet" : `${exerciseCount} ${exerciseCount === 1 ? "exercise" : "exercises"}`;
  return `${daysLabel(days)} · ${exercises}`;
}

/**
 * Pure: the counter above the list in two parts, so the number can be bold:
 * "3 of 3" + "free routines used" (free), or "3" + "routines" (Pro).
 */
export function routineCounterParts(count: number, isPro: boolean): { strong: string; rest: string } {
  if (isPro) return { strong: String(count), rest: count === 1 ? "routine" : "routines" };
  return { strong: `${count} of ${FREE_ROUTINE_LIMIT}`, rest: "free routines used" };
}

/** Pure: the counter as one line, e.g. "1 of 3 free routines used" (free) or "3 routines" (Pro). */
export function routineCounter(count: number, isPro: boolean): string {
  const { strong, rest } = routineCounterParts(count, isPro);
  return `${strong} ${rest}`;
}

/** Pure: the names of the first three exercises, then "and N more", e.g. "Bench press, Row, Curl and 2 more". */
export function routinePreview(names: readonly string[], total: number): string {
  if (total === 0) return "No exercises yet";
  const shown = names.slice(0, 3);
  const more = total - shown.length;
  if (more <= 0) {
    if (shown.length === 1) return shown[0];
    return `${shown.slice(0, -1).join(", ")} and ${shown[shown.length - 1]}`;
  }
  return `${shown.join(", ")} and ${more} more`;
}
