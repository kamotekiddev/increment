import { useMemo } from "react";

import { proStore, useIsPro } from "@/pro";

import { lockedRoutineIds } from "./routineLimit";
import { loadRoutineIds } from "./routineQueries";

const NONE: ReadonlySet<number> = new Set();

/**
 * The one place that reads the Pro gate for the routine lock (product rule 7). Callers get the
 * Locked routine ids and never pass `isPro` or the id list around by hand.
 *
 * React: the Locked ids for the routine list the caller already loaded. Undefined while that list
 * is unresolved and the lifter is not Pro (the answer is not known yet). With Pro it is always empty.
 */
export function useLockedRoutineIds(routines: readonly { id: number }[] | undefined): ReadonlySet<number> | undefined {
  const isPro = useIsPro();
  return useMemo(() => {
    if (isPro) return NONE;
    if (!routines) return undefined;
    return new Set(lockedRoutineIds(routines.map((r) => r.id), false));
  }, [isPro, routines]);
}

/** Non-React: the Locked ids for these routine ids, with Pro read from the store right now. */
export function lockedIdsNow(routineIds: readonly number[]): ReadonlySet<number> {
  return new Set(lockedRoutineIds(routineIds, proStore.getState().isPro));
}

/** Non-React: the Locked ids read fresh from the database and the store, for a moment of action (Start). */
export async function loadLockedRoutineIds(): Promise<ReadonlySet<number>> {
  return lockedIdsNow(await loadRoutineIds());
}
