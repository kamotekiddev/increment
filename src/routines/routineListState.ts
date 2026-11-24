import { lockedRoutineIds } from "./routineLimit";
import { routineCounterParts } from "./routineListText";

export interface RoutineCounterCard {
  kind: "pro" | "free" | "locked";
  /** The bold part, e.g. "2 of 2" or "2 routines locked.". */
  strong: string;
  rest: string;
}

/**
 * Pure: what the Routines tab shows above the list. With Pro, the plain count. Free with nothing
 * locked, the "N of 2" counter. Free with any Locked routine, the "N routines locked." card.
 * Also the set of locked ids, so rows can dim themselves.
 */
export function routineListState(
  routineIds: readonly number[],
  isPro: boolean,
): { card: RoutineCounterCard; lockedIds: ReadonlySet<number> } {
  const lockedIds = new Set(lockedRoutineIds(routineIds, isPro));
  const parts = routineCounterParts(routineIds.length, isPro);
  if (isPro) return { card: { kind: "pro", ...parts }, lockedIds };
  if (lockedIds.size === 0) return { card: { kind: "free", ...parts }, lockedIds };
  const n = lockedIds.size;
  return {
    card: { kind: "locked", strong: `${n} ${n === 1 ? "routine" : "routines"} locked.`, rest: "Unlock Pro to use them again." },
    lockedIds,
  };
}
