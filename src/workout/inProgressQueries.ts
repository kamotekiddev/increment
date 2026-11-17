import { eq } from "drizzle-orm";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { db } from "@/db/client";
import { routines, workouts } from "@/db/schema";

import type { InProgressWorkout } from "./types";

export type { InProgressWorkout } from "./types";

/** The workout in progress with its routine's name, or null when there is none. */
export function findInProgressWorkout(): InProgressWorkout | null {
  const row = db
    .select({ id: workouts.id, routineId: workouts.routineId, startedAt: workouts.startedAt, routineName: routines.name })
    .from(workouts)
    .leftJoin(routines, eq(routines.id, workouts.routineId))
    .where(eq(workouts.inProgress, true))
    .get();
  return row ?? null;
}

/**
 * The workout in progress, re-read each time the screen gains focus. Start, Finish and Discard all
 * end by navigating, so the screen that shows the bar gains focus again and picks the change up.
 */
export function useInProgressOnFocus(): InProgressWorkout | null {
  const [workout, setWorkout] = useState<InProgressWorkout | null>(() => findInProgressWorkout());
  useFocusEffect(
    useCallback(() => {
      setWorkout(findInProgressWorkout());
    }, []),
  );
  return workout;
}

/** The current time in ms, ticking each second from the clock alone (no database read) while `active`. */
export function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}
