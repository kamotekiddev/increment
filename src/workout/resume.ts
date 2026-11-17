/** A workout whose last saved edit is older than this is not reopened on launch (the bar still offers it). */
export const RESUME_WINDOW_MS = 12 * 60 * 60 * 1000;

/** The last saved edit of a workout, falling back to its start for one that was never edited. */
export function lastActivity(workout: { lastEditedAt: number | null; startedAt: number }): number {
  return workout.lastEditedAt ?? workout.startedAt;
}

/** Whether a cold launch reopens the workout in progress: its last saved edit is within the window. */
export function shouldAutoOpen(lastActivityAt: number, now: number): boolean {
  return now - lastActivityAt <= RESUME_WINDOW_MS;
}

/** The first exercise that still has an open set, or 0 when every set is done. */
export function firstOpenExercise(exercises: { rows: { done: boolean }[] }[]): number {
  const index = exercises.findIndex((e) => e.rows.some((r) => !r.done));
  return index === -1 ? 0 : index;
}
