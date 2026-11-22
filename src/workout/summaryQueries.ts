import { asc, eq, inArray, and } from "drizzle-orm";
import { useMemo } from "react";

import { db } from "@/db/client";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";
import { buildSummary, type OfferItem, type Summary } from "./summary";
import { toSummaryInput, type SavedExercise } from "./summaryInput";
import type { Target } from "../engine";
import type { Unit } from "../units";
import { jumpColumns, jumpsOf, pastExercises } from "./workoutQueries";

export interface LoadedSummary {
  /** The routine's name, or null when the routine is gone. */
  title: string | null;
  summary: Summary;
}

/**
 * Reads the finished workout and, per exercise, the history of its routine exercise (this workout
 * included, since Finish has already saved it), then builds the summary. Null when the workout does
 * not exist. Each exercise steps by its routine exercise's Jump for `unit`.
 */
export function loadSummary(workoutId: number, unit: Unit): LoadedSummary | null {
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
      ...jumpColumns,
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
    jumps: jumpsOf(e),
    loadType: e.loadType,
    plan:
      e.planSets !== null && e.repMin !== null && e.repMax !== null && e.rule !== null
        ? { planned: { sets: e.planSets, repMin: e.repMin, repMax: e.repMax }, rule: e.rule }
        : null,
    sets: setRows.filter((s) => s.workoutExerciseId === e.id),
    past: workout.routineId === null ? [] : pastExercises(db, workout.routineId, e.exerciseId),
  }));

  const input = toSummaryInput({ startedAt: workout.startedAt, finishedAt: workout.finishedAt, exercises: saved }, unit);
  return { title: routineName, summary: buildSummary(input) };
}

/**
 * Saves the lifter's answer to an Offer at once: Accept is true, Decline is false. Accept also saves
 * `stepped`, the Target the Offer showed, so the next Start shows that Target even if the step changes,
 * and `unit`, the unit it was offered in, so it snaps to the Jump's grid if the lifter later switches unit.
 */
export function answerOffer(workoutExerciseId: number, accepted: boolean, stepped: Target, unit: Unit): void {
  db.update(workoutExercises)
    .set({
      progressAccepted: accepted,
      acceptedTargetWeightKg: accepted ? stepped.weightKg : null,
      acceptedTargetReps: accepted ? stepped.reps : null,
      acceptedTargetUnit: accepted ? unit : null,
    })
    .where(eq(workoutExercises.id, workoutExerciseId))
    .run();
}

/** The Offers of a finished workout, in workout order. Empty when nothing is Earned or the workout is gone. */
export function loadOffers(workoutId: number, unit: Unit): OfferItem[] {
  return loadSummary(workoutId, unit)?.summary.offers ?? [];
}

/** The summary of a finished workout, read when the screen opens and again when the unit (the card lines are written in it, and it picks each step) changes. Null when the workout does not exist. */
export function useSummary(workoutId: number, unit: Unit): LoadedSummary | null {
  return useMemo(() => loadSummary(workoutId, unit), [workoutId, unit]);
}
