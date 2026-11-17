import type { TodayInput, TodayRoutine } from "./todayState";

/** Local midnight of the Sunday that starts the week containing `now`, epoch ms. */
export function weekStart(now: number): number {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay()).getTime();
}

/** Local midnight of the Sunday after the week containing `now`, epoch ms (exclusive end of the week). */
export function weekEnd(now: number): number {
  const d = new Date(weekStart(now));
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7).getTime();
}

/** Pure: maps database rows to the builder's input. Extra row fields are dropped. */
export function toTodayInput(
  now: number,
  routines: (TodayRoutine & { position?: number })[],
  finished: { routineId: number | null; startedAt: number }[],
  inProgress: { routineId: number | null } | null,
): TodayInput {
  return {
    now,
    routines: routines.map(({ id, name, days }) => ({ id, name, days })),
    finished: finished.map(({ routineId, startedAt }) => ({ routineId, startedAt })),
    inProgress: inProgress ? { routineId: inProgress.routineId } : null,
  };
}
