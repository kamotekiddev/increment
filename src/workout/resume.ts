import type { RestTimer } from "./restTimer";

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

/** The rest timer as stored on the workout. All null when no rest was running. */
export interface StoredRest {
  endsAt: number | null;
  totalMs: number | null;
  exerciseIndex: number | null;
  setIndex: number | null;
}

/** The stored rest as a running timer, or null when none was stored or it has already ended. */
export function restoreTimer(stored: StoredRest, now: number): RestTimer | null {
  const { endsAt, totalMs, exerciseIndex, setIndex } = stored;
  if (endsAt === null || totalMs === null || exerciseIndex === null || setIndex === null) return null;
  if (endsAt <= now) return null;
  return { endsAt, totalMs, set: { exerciseIndex, setIndex } };
}

/** A running timer as the columns to store; all null for no timer. */
export function storedRest(timer: RestTimer | null): StoredRest {
  return timer
    ? { endsAt: timer.endsAt, totalMs: timer.totalMs, exerciseIndex: timer.set.exerciseIndex, setIndex: timer.set.setIndex }
    : { endsAt: null, totalMs: null, exerciseIndex: null, setIndex: null };
}
