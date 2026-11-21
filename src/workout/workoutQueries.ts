import { and, asc, desc, eq, inArray } from "drizzle-orm";
import { useEffect, useState } from "react";

import { db, type Db } from "@/db/client";
import { exercises, routineExercises, sets, workoutExercises, workouts } from "@/db/schema";
import { nextTarget, type LoadType, type Target, type WeightUnit } from "@/engine";
import { stepKgFor, type Steps, type Unit } from "@/units";

import { toHistory, type PastExercise } from "./historyInputs";
import { applyEdit, type SetEdit } from "./applyEdit";
import { followUnitRows } from "./followUnit";
import { initialSetRows } from "./initialSetRows";
import { setDone } from "./markDone";
import { rowFromStored, weightToStore } from "./setStorage";
import type { SetRow } from "./types";

/** Local calendar date as YYYY-MM-DD. */
function localDate(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** A database or a transaction on it: what the shared queries below run against. */
type Queryable = Pick<Db, "select" | "delete">;

/**
 * Every finished workout's record of one routine exercise (this routine, this exercise), newest
 * first, each with its sets. Feeds the engine's history and the Last column.
 */
export function pastExercises(q: Queryable, routineId: number, exerciseId: number): PastExercise[] {
  const past = q
    .select({
      id: workoutExercises.id,
      startedAt: workouts.startedAt,
      date: workouts.date,
      targetWeightKg: workoutExercises.targetWeightKg,
      targetReps: workoutExercises.targetReps,
      targetUnit: workoutExercises.targetUnit,
      progressAccepted: workoutExercises.progressAccepted,
      acceptedTargetWeightKg: workoutExercises.acceptedTargetWeightKg,
      acceptedTargetReps: workoutExercises.acceptedTargetReps,
      acceptedTargetUnit: workoutExercises.acceptedTargetUnit,
      isDeload: workoutExercises.isDeload,
    })
    .from(workoutExercises)
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(workouts.routineId, routineId), eq(workouts.inProgress, false), eq(workoutExercises.exerciseId, exerciseId)))
    .orderBy(desc(workouts.startedAt))
    .all();
  if (past.length === 0) return [];
  const pastSets = q
    .select()
    .from(sets)
    .where(
      inArray(
        sets.workoutExerciseId,
        past.map((p) => p.id),
      ),
    )
    .all();
  return past.map(({ id, ...p }) => ({ ...p, sets: pastSets.filter((s) => s.workoutExerciseId === id) }));
}

/** Deletes a Workout exercise and its sets. */
function deleteWorkoutExercise(q: Queryable, workoutExerciseId: number): void {
  q.delete(sets).where(eq(sets.workoutExerciseId, workoutExerciseId)).run();
  q.delete(workoutExercises).where(eq(workoutExercises.id, workoutExerciseId)).run();
}

/**
 * Starts a workout from a routine as it is now, in one synchronous transaction. Each exercise's
 * Target comes from the engine, reading only finished workouts of this routine (ADR 0002) and
 * stepping by the routine exercise's step for the lifter's current `unit` (2.5 kg / 5 lb until set). Each
 * Target records that unit, so a Target set in the other unit snaps to the Jump's grid next time. Returns the
 * new workout id, or null when the routine has no exercises.
 */
export function startWorkout(routineId: number, unit: Unit, now: Date = new Date()): number | null {
  return db.transaction((tx) => {
    const planned = tx
      .select({
        exerciseId: routineExercises.exerciseId,
        sets: routineExercises.sets,
        repMin: routineExercises.repMin,
        repMax: routineExercises.repMax,
        rule: routineExercises.rule,
        stepKg: routineExercises.stepKg,
        stepLb: routineExercises.stepLb,
        loadType: exercises.loadType,
      })
      .from(routineExercises)
      .innerJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
      .where(eq(routineExercises.routineId, routineId))
      .orderBy(asc(routineExercises.position), asc(routineExercises.id))
      .all();
    if (planned.length === 0) return null;

    const workout = tx
      .insert(workouts)
      .values({ routineId, startedAt: now.getTime(), date: localDate(now), inProgress: true, lastEditedAt: now.getTime() })
      .returning({ id: workouts.id })
      .get();

    planned.forEach((ex, position) => {
      const rows = pastExercises(tx, routineId, ex.exerciseId);
      const { target, reason } = nextTarget({
        rule: ex.rule,
        planned: { sets: ex.sets, repMin: ex.repMin, repMax: ex.repMax },
        loadType: ex.loadType,
        history: toHistory(rows, ex.sets),
        jumpKg: stepKgFor(ex, unit),
        unit,
      });

      const workoutExercise = tx
        .insert(workoutExercises)
        .values({
          workoutId: workout.id,
          exerciseId: ex.exerciseId,
          position,
          targetWeightKg: target?.weightKg ?? null,
          targetReps: target?.reps ?? null,
          targetUnit: unit,
          // A due Deload is recorded, so it skips the Streak and the next Deload counts its weeks from here.
          isDeload: reason === "deload",
        })
        .returning({ id: workoutExercises.id })
        .get();

      // Pre-filled in the lifter's unit: the Target as a number in that unit (135 lb, 62.5 kg).
      initialSetRows({ sets: ex.sets, repMin: ex.repMin, repMax: ex.repMax }, target, unit).forEach((row, idx) => {
        tx.insert(sets)
          .values({
            workoutExerciseId: workoutExercise.id,
            exerciseId: ex.exerciseId,
            idx,
            weight: weightToStore(row.weight),
            weightUnit: row.unit,
            reps: row.reps,
          })
          .run();
      });
    });
    return workout.id;
  });
}

/** Rest length used when a workout's routine exercise was deleted. */
const DEFAULT_REST_SECONDS = 90;

export interface LiveSet extends SetRow {
  setId: number;
}

export interface LiveExercise {
  id: number;
  name: string;
  /**
   * The routine exercise's saved steps, read with the unit on screen (`stepKgFor`) since the unit can change
   * mid-workout. Both null when the routine exercise is gone, which is the 2.5 kg / 5 lb default.
   */
  steps: Steps;
  target: Target | null;
  /** The lifter's unit when Start set the Target; null on rows saved before it was stored. */
  targetUnit: WeightUnit | null;
  range: { repMin: number; repMax: number } | null;
  /** The Routine exercise's Rest length in seconds; the default when the routine exercise is gone. */
  restSeconds: number;
  loadType: LoadType;
  rows: LiveSet[];
}

export interface LiveWorkout {
  id: number;
  routineId: number | null;
  exercises: LiveExercise[];
}

/** A workout with its exercises and set rows, or null when it no longer exists. */
export async function loadWorkout(id: number): Promise<LiveWorkout | null> {
  const workout = (await db.select().from(workouts).where(eq(workouts.id, id)))[0];
  if (!workout) return null;
  const exRows = await db
    .select({
      id: workoutExercises.id,
      name: exercises.name,
      targetWeightKg: workoutExercises.targetWeightKg,
      targetReps: workoutExercises.targetReps,
      targetUnit: workoutExercises.targetUnit,
      stepKg: routineExercises.stepKg,
      stepLb: routineExercises.stepLb,
      repMin: routineExercises.repMin,
      repMax: routineExercises.repMax,
      restS: routineExercises.restS,
      loadType: exercises.loadType,
    })
    .from(workoutExercises)
    .innerJoin(exercises, eq(exercises.id, workoutExercises.exerciseId))
    .leftJoin(
      routineExercises,
      and(eq(routineExercises.routineId, workout.routineId ?? -1), eq(routineExercises.exerciseId, workoutExercises.exerciseId)),
    )
    .where(eq(workoutExercises.workoutId, id))
    .orderBy(asc(workoutExercises.position));
  const setRows = exRows.length
    ? await db
        .select()
        .from(sets)
        .where(
          inArray(
            sets.workoutExerciseId,
            exRows.map((e) => e.id),
          ),
        )
        .orderBy(asc(sets.idx))
    : [];
  return {
    id: workout.id,
    routineId: workout.routineId,
    exercises: exRows.map((e) => ({
      id: e.id,
      name: e.name,
      steps: { stepKg: e.stepKg, stepLb: e.stepLb },
      target: e.targetWeightKg !== null && e.targetReps !== null ? { weightKg: e.targetWeightKg, reps: e.targetReps } : null,
      targetUnit: e.targetUnit,
      range: e.repMin !== null && e.repMax !== null ? { repMin: e.repMin, repMax: e.repMax } : null,
      restSeconds: e.restS ?? DEFAULT_REST_SECONDS,
      loadType: e.loadType,
      rows: setRows.filter((s) => s.workoutExerciseId === e.id).map((s) => ({ ...rowFromStored(s), setId: s.id })),
    })),
  };
}

/** The workout, loaded once. Undefined until loaded; null when it does not exist. */
export function useWorkout(id: number): [LiveWorkout | null | undefined, (w: LiveWorkout) => void] {
  const [workout, setWorkout] = useState<LiveWorkout | null | undefined>(undefined);
  useEffect(() => {
    let live = true;
    loadWorkout(id).then((w) => {
      if (live) setWorkout(w);
    });
    return () => {
      live = false;
    };
  }, [id]);
  return [workout, setWorkout];
}

/**
 * Marks a set done or not done and writes it at once. A weighted set with a blank weight is not
 * marked (the write is skipped); a bodyweight set is saved at weight 0. A set is checked as the screen
 * shows it in `unit` (`followUnit`): an untouched 100 kg row shown as 220 lb is saved as 220 lb, and a typed
 * or checked row keeps its saved number and unit. Unchecking writes only the done mark. Returns the updated
 * rows of that exercise.
 */
export function markSetDone(rows: LiveSet[], index: number, done: boolean, unit: Unit, loadType: LoadType, jumpKg: number): LiveSet[] {
  const shown = followUnitRows(rows, unit, jumpKg);
  const next = setDone(shown, index, done, loadType) as LiveSet[];
  if (next === shown) return rows;
  const row = next[index];
  db.transaction((tx) => {
    tx.update(sets)
      .set(done ? { done, weight: weightToStore(row.weight), weightUnit: row.unit } : { done })
      .where(eq(sets.id, row.setId))
      .run();
    touchWorkout(tx, row.setId);
  });
  return rows.map((r, i) => (i === index ? row : r));
}

/** Stamps the workout that owns this set as just edited, which is what crash resume's 12-hour window reads. */
function touchWorkout(q: Pick<Db, "select" | "update">, setId: number, now: number = Date.now()): void {
  const owner = q
    .select({ workoutId: workoutExercises.workoutId })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .where(eq(sets.id, setId))
    .get();
  if (owner) q.update(workouts).set({ lastEditedAt: now }).where(eq(workouts.id, owner.workoutId)).run();
}

/** Deletes a workout with its Workout exercises and sets, in one transaction. */
export function discardWorkout(id: number): void {
  db.transaction((tx) => {
    const exRows = tx.select({ id: workoutExercises.id }).from(workoutExercises).where(eq(workoutExercises.workoutId, id)).all();
    exRows.forEach((ex) => deleteWorkoutExercise(tx, ex.id));
    tx.delete(workouts).where(eq(workouts.id, id)).run();
  });
}

/**
 * Finishes a workout in one transaction: drops sets that are not done and removes exercises with no
 * done set. Kept sets keep their idx, which is their plan position, so a gap left by an unchecked
 * set stays; the engine reads history by that position
 * (judgedPastSets). Then sets the finish time and clears in-progress. The Target on each kept
 * Workout exercise is untouched and progress_accepted stays false.
 */
export function finishWorkout(id: number, now: Date = new Date()): void {
  db.transaction((tx) => {
    const exRows = tx.select({ id: workoutExercises.id }).from(workoutExercises).where(eq(workoutExercises.workoutId, id)).all();
    for (const ex of exRows) {
      const rows = tx.select().from(sets).where(eq(sets.workoutExerciseId, ex.id)).all();
      if (!rows.some((r) => r.done)) {
        deleteWorkoutExercise(tx, ex.id);
        continue;
      }
      tx.delete(sets).where(and(eq(sets.workoutExerciseId, ex.id), eq(sets.done, false))).run();
    }
    tx.update(workouts).set({ finishedAt: now.getTime(), inProgress: false }).where(eq(workouts.id, id)).run();
  });
}

/** Discards the workout in progress, then starts the routine. Returns the new workout id (null when the routine is empty). */
export function discardAndStartWorkout(inProgressId: number, routineId: number, unit: Unit): number | null {
  discardWorkout(inProgressId);
  return startWorkout(routineId, unit);
}

/**
 * Applies a typed or stepped edit to one row, following the rule, and writes every row it changed. The edit
 * applies to the rows as shown in `unit` (`followUnit`), and each changed row is saved with its number and
 * unit together: a typed weight in the unit on screen, as typed.
 */
export function editSet(rows: LiveSet[], index: number, edit: SetEdit, unit: Unit, jumpKg: number): LiveSet[] {
  const shown = followUnitRows(rows, unit, jumpKg);
  const next = applyEdit(shown, index, edit).map((r, i) => ({ ...r, setId: rows[i].setId })) as LiveSet[];
  const changed = (r: LiveSet, i: number) =>
    r.weight !== shown[i].weight || r.unit !== shown[i].unit || r.reps !== shown[i].reps || r.edited !== shown[i].edited;
  db.transaction((tx) => {
    let wrote = false;
    next.forEach((r, i) => {
      if (!changed(r, i)) return;
      tx.update(sets)
        .set({ weight: weightToStore(r.weight), weightUnit: r.unit, reps: r.reps, edited: r.edited })
        .where(eq(sets.id, r.setId))
        .run();
      wrote = true;
    });
    if (wrote) touchWorkout(tx, next[0].setId);
  });
  return next.map((r, i) => (changed(r, i) ? r : rows[i]));
}

/**
 * For each exercise of a workout, the last finished workout's record of that routine exercise
 * (keyed by workout exercise id), or null when there is none. Feeds the Last column.
 */
export async function loadLastExercises(workoutId: number): Promise<Record<number, PastExercise | null>> {
  const workout = (await db.select().from(workouts).where(eq(workouts.id, workoutId)))[0];
  const current = await db
    .select({ id: workoutExercises.id, exerciseId: workoutExercises.exerciseId })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId));
  const result: Record<number, PastExercise | null> = {};
  for (const ex of current) {
    result[ex.id] = null;
    if (!workout || workout.routineId === null) continue;
    result[ex.id] = pastExercises(db, workout.routineId, ex.exerciseId)[0] ?? null;
  }
  return result;
}

/** The Last column's source data, loaded once. Empty until loaded. */
export function useLastExercises(workoutId: number): Record<number, PastExercise | null> {
  const [last, setLast] = useState<Record<number, PastExercise | null>>({});
  useEffect(() => {
    let live = true;
    loadLastExercises(workoutId).then((l) => {
      if (live) setLast(l);
    });
    return () => {
      live = false;
    };
  }, [workoutId]);
  return last;
}
