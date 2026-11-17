import { eq } from "drizzle-orm";
import { router } from "expo-router";
import { useEffect } from "react";

import { db } from "@/db/client";
import { workouts } from "@/db/schema";

import { lastActivity, shouldAutoOpen } from "./resume";

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
 * On a cold launch only: opens the workout in progress when its last saved edit was within 12 hours. The workout opens over Today, so Minimize lands there.
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
