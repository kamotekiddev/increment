import { and, asc, count, eq } from "drizzle-orm";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { db } from "@/db/client";
import { defaultRule } from "@/engine";
import { exercises, routineExercises, routines, workouts } from "@/db/schema";

import type { ExerciseSetup } from "./routineSetup";

export interface RoutineListItem {
  id: number;
  name: string;
  days: number;
  position: number;
  exerciseCount: number;
}

/** Phase 3 wires the real purchase state; until then every lifter is on the free plan. */
export function useIsPro(): boolean {
  return false;
}

/** Every routine in creation order, with its exercise count. */
export async function loadRoutines(): Promise<RoutineListItem[]> {
  const [rows, counts] = await Promise.all([
    db.select().from(routines).orderBy(asc(routines.position), asc(routines.id)),
    db
      .select({ routineId: routineExercises.routineId, n: count() })
      .from(routineExercises)
      .groupBy(routineExercises.routineId),
  ]);
  const byRoutine = new Map(counts.map((c) => [c.routineId, c.n]));
  return rows.map((r) => ({ ...r, exerciseCount: byRoutine.get(r.id) ?? 0 }));
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

/** Inserts a routine at the end of the list and returns its id. */
export async function createRoutine(name: string, days: number): Promise<number> {
  const [{ n }] = await db.select({ n: count() }).from(routines);
  const [row] = await db.insert(routines).values({ name, days, position: n }).returning({ id: routines.id });
  return row.id;
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
 * Deletes a routine. The database cascades to its routine exercises and its workouts, with their
 * workout exercises and sets. Workouts with no routine are never touched.
 */
export async function deleteRoutine(id: number): Promise<void> {
  await db.delete(routines).where(eq(routines.id, id));
}

export interface RoutineExerciseItem extends ExerciseSetup {
  id: number;
  exerciseId: number;
  name: string;
  position: number;
}

/** A routine's exercises in order, with names. */
export async function loadRoutineExercises(routineId: number): Promise<RoutineExerciseItem[]> {
  return db
    .select({
      id: routineExercises.id,
      exerciseId: routineExercises.exerciseId,
      name: exercises.name,
      position: routineExercises.position,
      sets: routineExercises.sets,
      repMin: routineExercises.repMin,
      repMax: routineExercises.repMax,
      restS: routineExercises.restS,
    })
    .from(routineExercises)
    .innerJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
    .where(eq(routineExercises.routineId, routineId))
    .orderBy(asc(routineExercises.position), asc(routineExercises.id));
}

/** The routine's exercises, reloaded each time the screen gains focus. Undefined until first load. */
export function useRoutineExercises(routineId: number): RoutineExerciseItem[] | undefined {
  const [items, setItems] = useState<RoutineExerciseItem[] | undefined>(undefined);
  useFocusEffect(
    useCallback(() => {
      let live = true;
      loadRoutineExercises(routineId).then((rows) => {
        if (live) setItems(rows);
      });
      return () => {
        live = false;
      };
    }, [routineId]),
  );
  return items;
}

/**
 * Adds an exercise at the end of a routine with the default rule for its load type. One row per
 * exercise per routine: returns false and changes nothing when it is already there.
 */
export async function addRoutineExercise(
  routineId: number,
  exerciseId: number,
  loadType: typeof exercises.$inferSelect.loadType,
  setup: ExerciseSetup,
): Promise<boolean> {
  const [{ present }] = await db
    .select({ present: count() })
    .from(routineExercises)
    .where(and(eq(routineExercises.routineId, routineId), eq(routineExercises.exerciseId, exerciseId)));
  if (present > 0) return false;
  const [{ n }] = await db
    .select({ n: count() })
    .from(routineExercises)
    .where(eq(routineExercises.routineId, routineId));
  await db
    .insert(routineExercises)
    .values({ routineId, exerciseId, position: n, ...setup, rule: defaultRule(loadType) });
  return true;
}
