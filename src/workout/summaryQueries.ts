import { asc, eq, inArray, and } from "drizzle-orm";
import { useState } from "react";

import { db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { buildSummary, type OfferItem, type Summary } from "./summary";
import { JUMP_KG } from "./jump";
import { toSummaryInput, type SavedExercise } from "./summaryInput";
import { pastExercises } from "./workoutQueries";

export interface LoadedSummary {
  /** The routine's name, or null when the routine is gone. */
  title: string | null;
  summary: Summary;
}

/**
 * Reads the finished workout and, per exercise, the history of its routine exercise (this workout
 * included, since Finish has already saved it), then builds the summary. Null when the workout does
 * not exist.
 */
export function loadSummary(workoutId: number): LoadedSummary | null {
  const workout = db.select().from(workouts).where(eq(workouts.id, workoutId)).get();
  if (!workout) return null;
  const routineName =
    workout.routineId === null ? null : (db.select({ name: routines.name }).from(routines).where(eq(routines.id, workout.routineId)).get()?.name ?? null);

  const exRows = db
    .select({
      id: workoutExercises.id,
      exerciseId: workoutExercises.exerciseId,
      name: exercises.name,
      loadType: exercises.loadType,
      planSets: routineExercises.sets,
      repMin: routineExercises.repMin,
      repMax: routineExercises.repMax,
      rule: routineExercises.rule,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(
      routineExercises,
      and(eq(routineExercises.routineId, workout.routineId ?? -1), eq(routineExercises.exerciseId, workoutExercises.exerciseId)),
    )
    .where(eq(workoutExercises.workoutId, workoutId))
    .orderBy(asc(workoutExercises.position))
    .all();
  const setRows = exRows.length
    ? db
        .select()
        .from(sets)
        .where(
          inArray(
            sets.workoutExerciseId,
            exRows.map((e) => e.id),
          ),
        )
        .all()
    : [];

  const saved: SavedExercise[] = exRows.map((e) => ({
    id: e.id,
    name: e.name,
    loadType: e.loadType,
    plan:
      e.planSets !== null && e.repMin !== null && e.repMax !== null && e.rule !== null
        ? { planned: { sets: e.planSets, repMin: e.repMin, repMax: e.repMax }, rule: e.rule }
        : null,
    sets: setRows.filter((s) => s.workoutExerciseId === e.id),
    past: workout.routineId === null ? [] : pastExercises(db, workout.routineId, e.exerciseId),
  }));

  const input = toSummaryInput({ startedAt: workout.startedAt, finishedAt: workout.finishedAt, exercises: saved }, JUMP_KG);
  return { title: routineName, summary: buildSummary(input) };
}

/** Saves the lifter's answer to an Offer at once: Accept is true, Decline is false. */
export function answerOffer(workoutExerciseId: number, accepted: boolean): void {
  db.update(workoutExercises).set({ progressAccepted: accepted }).where(eq(workoutExercises.id, workoutExerciseId)).run();
}

/** The Offers of a finished workout, in workout order. Empty when nothing is Earned or the workout is gone. */
export function loadOffers(workoutId: number): OfferItem[] {
  return loadSummary(workoutId)?.summary.offers ?? [];
}

/** The summary of a finished workout, read when the screen opens. Null when the workout does not exist. */
export function useSummary(workoutId: number): LoadedSummary | null {
  const [loaded] = useState(() => loadSummary(workoutId));
  return loaded;
}
