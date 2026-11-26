import { and, eq, isNotNull } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, userSettings, workoutExercises, workouts } from "@/db/schema";

import type { BackupData } from "./backupFile";

export type RestoreResult = "restored" | "workout-in-progress";

const USER_SETTINGS_ROW_ID = 1;

/** True while a Workout in progress exists on the phone. */
export function hasWorkoutInProgress(db: Pick<Db, "select">): boolean {
  return db.select({ id: workouts.id }).from(workouts).where(eq(workouts.inProgress, true)).limit(1).all().length > 0;
}

/**
 * Replaces the phone's training data with a parsed backup, in one transaction (all or nothing): routines,
 * workouts and their children, Custom exercises and `user_settings`. Never touches `entitlements`, the `settings`
 * key/value table (Last backup, seed version) or the seeded library rows. Ids in the file are the old phone's, so every
 * key is remapped: library exercises by slug to the local seeded id, everything else to fresh ids.
 * Blocked (nothing changes) while a Workout in progress exists. Throws, rolling back, if a library slug is not seeded
 * here. Re-planning reminders is the caller's job once this returns "restored".
 */
export function restoreBackup(db: Db, data: BackupData): RestoreResult {
  return db.transaction((tx): RestoreResult => {
    if (hasWorkoutInProgress(tx)) return "workout-in-progress";

    const exerciseMap = new Map<number, number>();
    for (const ref of data.libraryExercises) {
      const local = tx
        .select({ id: exercises.id })
        .from(exercises)
        .where(and(isNotNull(exercises.slug), eq(exercises.slug, ref.slug), eq(exercises.isCustom, false)))
        .get();
      if (!local) throw new Error(`Library exercise "${ref.slug}" is not on this phone.`);
      exerciseMap.set(ref.id, local.id);
    }

    // Children first, so nothing depends on cascades.
    tx.delete(sets).run();
    tx.delete(workoutExercises).run();
    tx.delete(workouts).run();
    tx.delete(routineExercises).run();
    tx.delete(routines).run();
    tx.delete(exercises).where(eq(exercises.isCustom, true)).run();

    for (const { id, ...row } of data.customExercises) {
      exerciseMap.set(id, tx.insert(exercises).values({ ...row, slug: null, isCustom: true }).returning({ id: exercises.id }).get().id);
    }
    const exerciseId = (old: number): number => {
      const id = exerciseMap.get(old);
      if (id === undefined) throw new Error("Backup points at an exercise that is not in it.");
      return id;
    };

    const routineMap = new Map<number, number>();
    for (const { id, ...row } of data.routines) {
      routineMap.set(id, tx.insert(routines).values(row).returning({ id: routines.id }).get().id);
    }
    for (const { id: _id, ...row } of data.routineExercises) {
      tx.insert(routineExercises)
        .values({ ...row, routineId: routineMap.get(row.routineId)!, exerciseId: exerciseId(row.exerciseId) })
        .run();
    }

    const workoutMap = new Map<number, number>();
    for (const { id, ...row } of data.workouts) {
      const routineId = row.routineId === null ? null : (routineMap.get(row.routineId) ?? null);
      workoutMap.set(id, tx.insert(workouts).values({ ...row, routineId, inProgress: false }).returning({ id: workouts.id }).get().id);
    }
    const weMap = new Map<number, number>();
    for (const { id, ...row } of data.workoutExercises) {
      weMap.set(
        id,
        tx
          .insert(workoutExercises)
          .values({ ...row, workoutId: workoutMap.get(row.workoutId)!, exerciseId: exerciseId(row.exerciseId) })
          .returning({ id: workoutExercises.id })
          .get().id,
      );
    }
    for (const { id: _id, ...row } of data.sets) {
      tx.insert(sets)
        .values({ ...row, workoutExerciseId: weMap.get(row.workoutExerciseId)!, exerciseId: exerciseId(row.exerciseId) })
        .run();
    }

    if (data.userSettings) {
      tx.insert(userSettings)
        .values({ id: USER_SETTINGS_ROW_ID, ...data.userSettings })
        .onConflictDoUpdate({ target: userSettings.id, set: data.userSettings })
        .run();
    }
    return "restored";
  });
}
