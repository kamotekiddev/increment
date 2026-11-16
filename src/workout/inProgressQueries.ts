import { eq } from "drizzle-orm";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";

import { db } from "@/db/client";
import { routines, workouts } from "@/db/schema";

export interface InProgressWorkout {
  id: number;
  /** Null when the routine was deleted. */
  routineId: number | null;
  routineName: string;
  startedAt: number;
}

/** The workout in progress with its routine's name, or null when there is none. */
export function loadInProgress(): InProgressWorkout | null {
  const row = db
    .select({ id: workouts.id, routineId: workouts.routineId, startedAt: workouts.startedAt, routineName: routines.name })
    .from(workouts)
    .leftJoin(routines, eq(routines.id, workouts.routineId))
    .where(eq(workouts.inProgress, true))
    .get();
  if (!row) return null;
  return { id: row.id, routineId: row.routineId, routineName: row.routineName ?? "Workout", startedAt: row.startedAt };
}

/**
 * The workout in progress, re-read every second so the bar's clock runs and the bar appears or
 * disappears soon after Start, Finish or Discard. Also returns the current time for the clock.
 */
export function useInProgressTicker(): { workout: InProgressWorkout | null; now: number } {
  const [state, setState] = useState(() => ({ workout: loadInProgress(), now: Date.now() }));
  useEffect(() => {
    const tick = () => setState({ workout: loadInProgress(), now: Date.now() });
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);
  return state;
}

/** The workout in progress, re-read each time the screen gains focus (e.g. back from the live screen). */
export function useInProgressOnFocus(): InProgressWorkout | null {
  const [workout, setWorkout] = useState<InProgressWorkout | null>(() => loadInProgress());
  useFocusEffect(
    useCallback(() => {
      setWorkout(loadInProgress());
    }, []),
  );
  return workout;
}
