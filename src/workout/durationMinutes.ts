/** A Workout's length in whole minutes, floored, never negative. The summary and History both read this. */
export function durationMinutes(startedAt: number, finishedAt: number): number {
  return Math.max(0, Math.floor((finishedAt - startedAt) / 60_000));
}
