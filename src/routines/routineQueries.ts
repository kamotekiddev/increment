import { asc, count, eq } from "drizzle-orm";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";

import { db } from "@/db/client";
import { routineExercises, routines, workouts } from "@/db/schema";

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
