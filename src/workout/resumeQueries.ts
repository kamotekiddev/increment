import { eq } from "drizzle-orm";
import { router } from "expo-router";
import { useEffect } from "react";

import { db } from "@/db/client";
import { workouts } from "@/db/schema";

import type { RestTimer } from "./restTimer";
import { useRestStore } from "./restStore";
import { lastActivity, restoreTimer, shouldAutoOpen, storedRest } from "./resume";

/** Writes the rest timer to the workout it belongs to, so a killed app can bring it back. */
function saveRest(workoutId: number, timer: RestTimer | null): void {
  const rest = storedRest(timer);
  db.update(workouts)
    .set({
      restEndsAt: rest.endsAt,
      restTotalMs: rest.totalMs,
      restExerciseIndex: rest.exerciseIndex,
      restSetIndex: rest.setIndex,
    })
    .where(eq(workouts.id, workoutId))
    .run();
}

/** Call once at app start: every change to the rest timer is saved on its workout, and cleared when it ends. */
export function setupRestPersistence() {
  useRestStore.subscribe((state, prev) => {
    if (state.timer === prev.timer && state.workoutId === prev.workoutId) return;
    try {
      // A timer that moved to another workout (or cleared) empties the workout it left.
      if (prev.workoutId !== null && prev.workoutId !== state.workoutId) saveRest(prev.workoutId, null);
      if (state.workoutId !== null) saveRest(state.workoutId, state.timer);
    } catch {
      // The timer still works from memory if the write fails.
    }
  });
}

/**
 * Brings the saved rest of a workout back into the timer store when it is still running. A rest that
 * ended while the app was dead is dropped without a buzz and without moving to another exercise.
 */
export function hydrateRest(workoutId: number, now: number = Date.now()): void {
  const row = db
    .select({
      endsAt: workouts.restEndsAt,
      totalMs: workouts.restTotalMs,
      exerciseIndex: workouts.restExerciseIndex,
      setIndex: workouts.restSetIndex,
    })
    .from(workouts)
    .where(eq(workouts.id, workoutId))
    .get();
  if (!row || row.endsAt === null) return;
  const timer = restoreTimer(row, now);
  if (timer) {
    if (!useRestStore.getState().timer) useRestStore.getState().apply({ kind: "start", timer }, workoutId);
  } else {
    saveRest(workoutId, null);
  }
}

/** The workout in progress with the time of its last saved edit, or null when there is none. */
function findResumable(): { id: number; lastActivityAt: number } | null {
  const row = db
    .select({ id: workouts.id, startedAt: workouts.startedAt, lastEditedAt: workouts.lastEditedAt })
    .from(workouts)
    .where(eq(workouts.inProgress, true))
    .get();
  return row ? { id: row.id, lastActivityAt: lastActivity(row) } : null;
}

/** True once this app process has handled its launch, so foregrounding never reopens a workout. */
let handled = false;

/**
 * On a cold launch only: restores the running rest, and opens the workout in progress when its last
 * saved edit was within 12 hours. The workout opens over Today, so Minimize lands there.
 */
export function useResumeOnLaunch() {
  useEffect(() => {
    if (handled) return;
    try {
      const workout = findResumable();
      if (!workout) {
        handled = true;
        return;
      }
      hydrateRest(workout.id);
      if (shouldAutoOpen(workout.lastActivityAt, Date.now())) {
        router.push({ pathname: "/workout/[id]", params: { id: String(workout.id) } });
      }
      // Only once the push went through, so a failure gets another try on the next mount.
      handled = true;
    } catch {
      // Resuming is a convenience: the bar above the tab bar still reopens the workout.
    }
  }, []);
}
