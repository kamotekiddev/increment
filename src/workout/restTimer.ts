import { formatWithUnit, type Unit } from "../units";
import type { SetRow } from "./types";

/** One set in the workout: which exercise (position in the screen's list) and which row. */
export interface SetRef {
  exerciseIndex: number;
  setIndex: number;
}

/** What the rules need to know about one exercise of the Workout. */
export interface RestExercise {
  name: string;
  /** The Routine exercise's Rest length in seconds, from the Workout's snapshot. */
  restSeconds: number;
  bodyweight: boolean;
  rows: SetRow[];
}

/** The one running rest. An end time, not a counter, so it stays right while the app sleeps. */
export interface RestTimer {
  /** Clock value (ms) when the rest ends. */
  endsAt: number;
  /** The rest's length in ms, for the ring. Grows if +15s takes it past its start. */
  totalMs: number;
  /** The set whose check started this rest. The exercise it belongs to is `set.exerciseIndex`. */
  set: SetRef;
}

/** What a set toggle does to the timer. */
export type RestAction =
  | { kind: "start"; timer: RestTimer }
  | { kind: "replace"; timer: RestTimer }
  | { kind: "cancel" }
  | { kind: "keep" }
  | { kind: "none" };

const hasOpen = (e: RestExercise) => e.rows.some((r) => !r.done);

/** What marking a set done or not done does to the timer. `exercises` already has the toggle applied. */
export function onSetToggled(input: {
  exercises: RestExercise[];
  set: SetRef;
  done: boolean;
  timer: RestTimer | null;
  now: number;
}): RestAction {
  const { exercises, set, done, timer, now } = input;
  if (!done) {
    const same = timer && timer.set.exerciseIndex === set.exerciseIndex && timer.set.setIndex === set.setIndex;
    return same ? { kind: "cancel" } : { kind: "keep" };
  }
  // Nothing left to rest for: no timer, and a running one is pointless.
  if (!exercises.some(hasOpen)) return timer ? { kind: "cancel" } : { kind: "none" };
  const totalMs = (exercises[set.exerciseIndex]?.restSeconds ?? 0) * 1000;
  // A Rest length of 0 means no rest: nothing starts, and a running rest from another exercise is dropped.
  if (totalMs <= 0) return timer ? { kind: "cancel" } : { kind: "none" };
  return { kind: timer ? "replace" : "start", timer: { endsAt: now + totalMs, totalMs, set } };
}

/** The next exercise with an open set after `from`, wrapping past the end. Never `from` itself. */
function nextOpenExercise(exercises: RestExercise[], from: number): number | null {
  for (let step = 1; step < exercises.length; step++) {
    const i = (from + step) % exercises.length;
    if (hasOpen(exercises[i])) return i;
  }
  return null;
}

function loadText(e: RestExercise, row: SetRow, unit: Unit): string | null {
  return e.bodyweight || row.weightKg === null || row.weightKg === 0 ? null : formatWithUnit(row.weightKg, unit);
}

/** The "Next up" line after a rest in exercise `exerciseIndex`. Null when nothing is open. */
export function nextUp(exercises: RestExercise[], exerciseIndex: number, unit: Unit): string | null {
  const current = exercises[exerciseIndex];
  if (current) {
    const i = current.rows.findIndex((r) => !r.done);
    if (i >= 0) {
      const row = current.rows[i];
      const load = loadText(current, row, unit);
      const reps = `${row.reps} ${row.reps === 1 ? "rep" : "reps"}`;
      return `Set ${i + 1} · ${load ? `${load} × ${row.reps}` : reps}`;
    }
  }
  const n = nextOpenExercise(exercises, exerciseIndex);
  if (n === null) return null;
  const next = exercises[n];
  const row = next.rows.find((r) => !r.done);
  if (!row) return null;
  const load = loadText(next, row, unit);
  return load ? `${next.name} · ${load}` : next.name;
}

/** What happens when a rest ends: the timer is cleared, then optionally buzz and move the screen. */
export interface Expiry {
  buzz: boolean;
  /** Exercise index to move the screen to, or null to stay. */
  advanceTo: number | null;
}

/** Resolves a rest that reached zero (countdown, −15s to zero, or found ended on return to the app). */
export function resolveExpiry(input: {
  exercises: RestExercise[];
  timer: RestTimer;
  /** The exercise the lifter is looking at now. */
  viewingIndex: number;
  /** The rest ended while the app was in the background: no buzz. */
  endedWhileAway: boolean;
}): Expiry {
  const { exercises, timer, viewingIndex, endedWhileAway } = input;
  const own = timer.set.exerciseIndex;
  const exercise = exercises[own];
  const finished = !!exercise && !hasOpen(exercise);
  const advanceTo = finished && viewingIndex === own ? nextOpenExercise(exercises, own) : null;
  return { buzz: !endedWhileAway, advanceTo };
}

/** Adds or removes seconds on the running rest only (never the stored Rest length). Floors at zero. */
export function adjustRest(timer: RestTimer, deltaSeconds: number, now: number): { timer: RestTimer; ended: boolean } {
  const remaining = Math.max(0, timer.endsAt - now + deltaSeconds * 1000);
  return {
    timer: { ...timer, endsAt: now + remaining, totalMs: Math.max(timer.totalMs, remaining) },
    ended: remaining === 0,
  };
}

/** Time left and ring fraction (1 full, 0 empty) at a clock value. `text` is m:ss, rounding partial seconds up. */
export function restRemaining(
  timer: RestTimer,
  now: number,
): { remainingMs: number; fraction: number; text: string; ended: boolean } {
  const remainingMs = Math.max(0, timer.endsAt - now);
  const fraction = timer.totalMs > 0 ? Math.min(1, remainingMs / timer.totalMs) : 0;
  const total = Math.ceil(remainingMs / 1000);
  const text = `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  return { remainingMs, fraction, text, ended: remainingMs === 0 };
}

/**
 * Milliseconds to wait before the countdown text changes again, so a clock can wake exactly then
 * instead of ticking at a random phase. A few ms are added to land just past the boundary. Null when the rest is over.
 */
export function msUntilTextChanges(remainingMs: number): number | null {
  if (remainingMs <= 0) return null;
  const shown = Math.ceil(remainingMs / 1000);
  return remainingMs - (shown - 1) * 1000 + 5;
}
