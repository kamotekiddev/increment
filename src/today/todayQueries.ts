import { and, gte, isNotNull, lt } from "drizzle-orm";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { db } from "@/db/client";
import { workouts } from "@/db/schema";
import { useRoutines } from "@/routines/routineQueries";
import { useInProgressOnFocus } from "@/workout/inProgressQueries";

import { toTodayInput, weekEnd, weekStart } from "./todayInput";
import type { TodayInput } from "./todayState";

/** Finished Workouts (not discarded, not in progress) that started in the local week containing `now`. */
export function findFinishedThisWeek(now: number): { routineId: number | null; startedAt: number }[] {
  return db
    .select({ routineId: workouts.routineId, startedAt: workouts.startedAt })
    .from(workouts)
    .where(and(isNotNull(workouts.finishedAt), gte(workouts.startedAt, weekStart(now)), lt(workouts.startedAt, weekEnd(now))))
    .all();
}

function readWeek() {
  const now = Date.now();
  return { now, finished: findFinishedThisWeek(now) };
}

/**
 * Everything Today needs, as the builder's input, re-read each time the screen gains focus (Finish,
 * Discard and a Routine's days change all happen on other screens). Undefined until the Routines
 * first load. Pass the result to `buildToday`.
 */
export function useTodayData(): TodayInput | undefined {
  const routines = useRoutines();
  const inProgress = useInProgressOnFocus();
  const [week, setWeek] = useState(readWeek);
  useFocusEffect(
    useCallback(() => {
      setWeek(readWeek());
    }, []),
  );
  return useMemo(
    () => (routines ? toTodayInput(week.now, routines, week.finished, inProgress) : undefined),
    [routines, inProgress, week],
  );
}
