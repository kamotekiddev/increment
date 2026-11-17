import type { FinishedWorkout, TodayInput, TodayRoutine } from "./todayState";

/** Pure: maps database rows to the builder's input. Extra row fields are dropped. */
export function toTodayInput(
  now: number,
  routines: (TodayRoutine & { position?: number })[],
  finished: FinishedWorkout[],
  inProgress: { routineId: number | null } | null,
): TodayInput {
  return {
    now,
    routines: routines.map(({ id, name, days }) => ({ id, name, days })),
    finished: finished.map(({ routineId, startedAt }) => ({ routineId, startedAt })),
    inProgress: inProgress ? { routineId: inProgress.routineId } : null,
  };
}
