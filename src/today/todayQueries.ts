import { and, asc, eq, gte, isNotNull, lt } from "drizzle-orm";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";

import { db } from "@/db/client";
import { exercises, routineExercises, workouts } from "@/db/schema";
import { nextTarget } from "@/engine";
import { useRoutines } from "@/routines/routineQueries";
import { useInProgressOnFocus } from "@/workout/inProgressQueries";
import { toHistory } from "@/workout/historyInputs";
import { JUMP_KG } from "@/workout/jump";
import { pastExercises } from "@/workout/workoutQueries";

import { toTodayInput } from "./todayInput";
import { PREVIEW_LIMIT, toNextPreview, type NextPreview } from "./nextPreview";
import type { FinishedWorkout, TodayInput } from "./todayState";
import { weekEnd, weekStart } from "./week";

/** Finished Workouts (not discarded, not in progress) that started in the local week containing `now`. */
export function findFinishedThisWeek(now: number): FinishedWorkout[] {
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
export function useTodayData(refreshKey = 0): TodayInput | undefined {
  const routines = useRoutines();
  const inProgress = useInProgressOnFocus();
  const [week, setWeek] = useState(readWeek);
  useFocusEffect(
    useCallback(() => {
      setWeek(readWeek());
      // `refreshKey` is a real trigger, not read in the body: a new value (a new local day while
      // the screen is open) re-runs this effect to re-read the week.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [refreshKey]),
  );
  return useMemo(
    () => (routines ? toTodayInput(week.now, routines, week.finished, inProgress) : undefined),
    [routines, inProgress, week],
  );
}

/**
 * The first exercises of a Routine with the Target each would get if started now: the same history
 * and engine call Start uses (finished workouts of this Routine only), without writing anything.
 */
export function loadNextPreview(routineId: number): NextPreview {
  const planned = db
    .select({
      exerciseId: routineExercises.exerciseId,
      name: exercises.name,
      equipment: exercises.equipment,
      loadType: exercises.loadType,
      sets: routineExercises.sets,
      repMin: routineExercises.repMin,
      repMax: routineExercises.repMax,
      rule: routineExercises.rule,
    })
    .from(routineExercises)
    .innerJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
    .where(eq(routineExercises.routineId, routineId))
    .orderBy(asc(routineExercises.position), asc(routineExercises.id))
    .all();
  const first = planned.slice(0, PREVIEW_LIMIT).map((ex) => ({
    name: ex.name,
    equipment: ex.equipment,
    loadType: ex.loadType,
    target: nextTarget({
      rule: ex.rule,
      planned: { sets: ex.sets, repMin: ex.repMin, repMax: ex.repMax },
      loadType: ex.loadType,
      history: toHistory(pastExercises(db, routineId, ex.exerciseId), ex.sets),
      jumpKg: JUMP_KG,
    }).target,
  }));
  return toNextPreview(first, planned.length);
}

/** The Next Routine's preview, re-read each time the screen gains focus (a finished workout moves the Targets). Undefined until read, or with no Routine. */
export function useNextPreview(routineId: number | undefined): NextPreview | undefined {
  const [preview, setPreview] = useState<{ routineId: number; value: NextPreview }>();
  useFocusEffect(
    useCallback(() => {
      if (routineId === undefined) return;
      setPreview({ routineId, value: loadNextPreview(routineId) });
    }, [routineId]),
  );
  return preview && preview.routineId === routineId ? preview.value : undefined;
}
