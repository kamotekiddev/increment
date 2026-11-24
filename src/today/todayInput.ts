import { withoutLocked } from "@/routines/openRoutines";

import type { FinishedWorkout, TodayInput, TodayRoutine } from "./todayState";

/** Pure: maps database rows to the builder's input. Extra row fields are dropped, and so are Locked routines (they are not on Today at all). */
export function toTodayInput(
  now: number,
  routines: (TodayRoutine & { position?: number })[],
  finished: FinishedWorkout[],
  inProgress: { routineId: number | null } | null,
  lockedIds: ReadonlySet<number>,
): TodayInput {
  const open = withoutLocked(routines, lockedIds);
  return {
    now,
    routines: open.map(({ id, name, days, exerciseCount }) => ({ id, name, days, exerciseCount })),
    lockedHaveDays: routines.some((r) => lockedIds.has(r.id) && r.days !== 0),
    finished: finished.map(({ routineId, startedAt }) => ({ routineId, startedAt })),
    inProgress: inProgress ? { routineId: inProgress.routineId } : null,
  };
}
