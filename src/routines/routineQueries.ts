import { asc, count, eq } from "drizzle-orm";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { db } from "@/db/client";
import { defaultRule, type OverloadRule } from "@/engine";
import { exercises, routineExercises, routines, workouts } from "@/db/schema";

import type { ExerciseSetup } from "./routineSetup";

export interface RoutineListItem {
  id: number;
  name: string;
  days: number;
  position: number;
  exerciseCount: number;
  /** Every exercise name in routine order; the list card shows the first few. */
  exerciseNames: string[];
}

/** Phase 3 wires the real purchase state; until then every lifter is on the free plan. */
export function useIsPro(): boolean {
  return false;
}

/** Every routine in creation order, with its exercise count. */
export async function loadRoutines(): Promise<RoutineListItem[]> {
  const [rows, named] = await Promise.all([
    db.select().from(routines).orderBy(asc(routines.position), asc(routines.id)),
    db
      .select({ routineId: routineExercises.routineId, name: exercises.name })
      .from(routineExercises)
      .innerJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
      .orderBy(asc(routineExercises.position), asc(routineExercises.id)),
  ]);
  const namesByRoutine = new Map<number, string[]>();
  for (const { routineId, name } of named) {
    const names = namesByRoutine.get(routineId) ?? [];
    names.push(name);
    namesByRoutine.set(routineId, names);
  }
  return rows.map((r) => {
    const exerciseNames = namesByRoutine.get(r.id) ?? [];
    return { ...r, exerciseCount: exerciseNames.length, exerciseNames };
  });
}

/** The routine list, reloaded each time the screen gains focus. Undefined until first load. */
export function useRoutines(): RoutineListItem[] | undefined {
  const [items, setItems] = useState<RoutineListItem[] | undefined>(undefined);
  useFocusEffect(
    useCallback(() => {
      let live = true;
      loadRoutines().then((rows) => {
        if (live) setItems(rows);
      });
      return () => {
        live = false;
      };
    }, []),
  );
  return items;
}

/**
 * Inserts a routine at the end of the list and returns its id. Count and insert run in one
 * transaction. The expo-sqlite driver runs a transaction synchronously, so the callback is not async.
 */
export function createRoutine(name: string, days: number): number {
  return db.transaction((tx) => {
    const [{ n }] = tx.select({ n: count() }).from(routines).all();
    const row = tx.insert(routines).values({ name, days, position: n }).returning({ id: routines.id }).get();
    return row.id;
  });
}

/** One routine by id, or null when it no longer exists. */
export async function loadRoutine(id: number) {
  const rows = await db.select().from(routines).where(eq(routines.id, id));
  return rows[0] ?? null;
}

/** Saves a routine's name. The caller has already validated it. */
export async function renameRoutine(id: number, name: string): Promise<void> {
  await db.update(routines).set({ name }).where(eq(routines.id, id));
}

/** Saves a routine's training days (bitmask, Monday = bit 0). */
export async function setRoutineDays(id: number, days: number): Promise<void> {
  await db.update(routines).set({ days }).where(eq(routines.id, id));
}

/** How many workouts belong to a routine, i.e. how many will go with it (ADR 0002). */
export async function countRoutineWorkouts(id: number): Promise<number> {
  const [{ n }] = await db.select({ n: count() }).from(workouts).where(eq(workouts.routineId, id));
  return n;
}

/**
 * Deletes a routine and renumbers the remaining routines to 0..n-1, in one transaction. The
 * database cascades to its routine exercises and its workouts, with their workout exercises and
 * sets. Workouts with no routine are never touched.
 */
export function deleteRoutine(id: number): void {
  db.transaction((tx) => {
    tx.delete(routines).where(eq(routines.id, id)).run();
    const rest = tx
      .select({ id: routines.id })
      .from(routines)
      .orderBy(asc(routines.position), asc(routines.id))
      .all();
    rest.forEach((r, position) => {
      tx.update(routines).set({ position }).where(eq(routines.id, r.id)).run();
    });
  });
}

export interface RoutineExerciseItem extends ExerciseSetup {
  id: number;
  exerciseId: number;
  name: string;
  muscles: string[];
  equipment: string;
  position: number;
  rule: OverloadRule;
}

/** A routine's exercises in order, with names. */
export async function loadRoutineExercises(routineId: number): Promise<RoutineExerciseItem[]> {
  return db
    .select({
      id: routineExercises.id,
      exerciseId: routineExercises.exerciseId,
      name: exercises.name,
      muscles: exercises.muscles,
      equipment: exercises.equipment,
      position: routineExercises.position,
      sets: routineExercises.sets,
      repMin: routineExercises.repMin,
      repMax: routineExercises.repMax,
      restS: routineExercises.restS,
      rule: routineExercises.rule,
    })
    .from(routineExercises)
    .innerJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
    .where(eq(routineExercises.routineId, routineId))
    .orderBy(asc(routineExercises.position), asc(routineExercises.id));
}

/** The routine's exercises, reloaded each time the screen gains focus. Undefined until first load. */
export function useRoutineExercises(routineId: number, version = 0): RoutineExerciseItem[] | undefined {
  const [items, setItems] = useState<RoutineExerciseItem[] | undefined>(undefined);
  useFocusEffect(
    useCallback(() => {
      let live = true;
      void version; // a change reloads the list after a save or remove
      loadRoutineExercises(routineId).then((rows) => {
        if (live) setItems(rows);
      });
      return () => {
        live = false;
      };
    }, [routineId, version]),
  );
  return items;
}

/**
 * Adds an exercise at the end of a routine with the default rule for its load type. One row per
 * exercise per routine (a unique index enforces it): returns false and changes nothing when it is
 * already there. Position and insert run in one synchronous transaction.
 */
export function addRoutineExercise(
  routineId: number,
  exerciseId: number,
  loadType: typeof exercises.$inferSelect.loadType,
  setup: ExerciseSetup,
): boolean {
  return db.transaction((tx) => {
    const [{ n }] = tx
      .select({ n: count() })
      .from(routineExercises)
      .where(eq(routineExercises.routineId, routineId))
      .all();
    const inserted = tx
      .insert(routineExercises)
      .values({ routineId, exerciseId, position: n, ...setup, rule: defaultRule(loadType) })
      .onConflictDoNothing()
      .returning({ id: routineExercises.id })
      .all();
    return inserted.length > 0;
  });
}

/** Saves new sets, rep range and rest on this routine exercise row only. */
export async function updateRoutineExercise(routineExerciseId: number, setup: ExerciseSetup): Promise<void> {
  await db.update(routineExercises).set(setup).where(eq(routineExercises.id, routineExerciseId));
}

/**
 * Removes one routine exercise and renumbers the rest to 0..n-1, in one transaction (synchronous,
 * like the driver). Logged workouts and their sets are not touched.
 */
export function removeRoutineExercise(routineExerciseId: number): void {
  db.transaction((tx) => {
    const row = tx
      .select({ routineId: routineExercises.routineId })
      .from(routineExercises)
      .where(eq(routineExercises.id, routineExerciseId))
      .get();
    if (!row) return;
    tx.delete(routineExercises).where(eq(routineExercises.id, routineExerciseId)).run();
    const rest = tx
      .select({ id: routineExercises.id })
      .from(routineExercises)
      .where(eq(routineExercises.routineId, row.routineId))
      .orderBy(asc(routineExercises.position), asc(routineExercises.id))
      .all();
    rest.forEach((r, position) => {
      tx.update(routineExercises).set({ position }).where(eq(routineExercises.id, r.id)).run();
    });
  });
}
