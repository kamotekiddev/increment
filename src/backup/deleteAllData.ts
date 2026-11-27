import { inArray, eq } from "drizzle-orm";

import type { Db } from "@/db/client";
import { exercises, routineExercises, routines, sets, settings, userSettings, workoutExercises, workouts } from "@/db/schema";

import { isOnboarded } from "@/onboarding/onboarding";

import { hasWorkoutInProgress } from "./restoreBackup";

export type DeleteAllResult = "deleted" | "workout-in-progress";

const USER_SETTINGS_ROW_ID = 1;

/**
 * The `settings` keys Delete all data clears: automatic backups (on, keep, folder, frequency, failing), Last backup and
 * the backup fingerprint. Not listed on purpose: the library seed version, which must survive. Keys are those written by
 * `autoBackupSettings.ts` and `backupQueries.ts`.
 */
const CLEARED_SETTING_KEYS = [
  "auto_backup_on",
  "auto_backup_keep",
  "auto_backup_folder",
  "auto_backup_frequency",
  "auto_backup_failing",
  "last_backup_hash",
  "last_backup_at",
];

/**
 * Removes everything the lifter made, in one transaction (all or nothing): workouts and their sets, routines, Custom
 * exercises, then resets `user_settings` to its defaults and clears the automatic backup settings, Last backup and the
 * backup fingerprint. Keeps `entitlements`, the seeded library exercises and the seed version, and never touches files on
 * disk. Blocked (nothing changes) while a Workout in progress exists. Cancelling reminders and reloading the stores
 * is the caller's job once this returns "deleted".
 */
export function deleteAllData(db: Db): DeleteAllResult {
  return db.transaction((tx): DeleteAllResult => {
    if (hasWorkoutInProgress(tx)) return "workout-in-progress";

    // Children first, so nothing depends on cascades.
    tx.delete(sets).run();
    tx.delete(workoutExercises).run();
    tx.delete(workouts).run();
    tx.delete(routineExercises).run();
    tx.delete(routines).run();
    tx.delete(exercises).where(eq(exercises.isCustom, true)).run();

    // Drop the row and insert it bare, so every column takes its schema default (no second list of defaults here).
    // `onboarded` is device state and survives: Delete all data never brings Welcome back.
    const onboarded = isOnboarded(tx);
    tx.delete(userSettings).run();
    tx.insert(userSettings).values({ id: USER_SETTINGS_ROW_ID, onboarded }).run();
    tx.delete(settings).where(inArray(settings.key, CLEARED_SETTING_KEYS)).run();
    return "deleted";
  });
}

/** The typed confirmation: the word DELETE, ignoring case and surrounding spaces. */
export function deleteConfirmed(typed: string): boolean {
  return typed.trim().toLowerCase() === "delete";
}

/** The sheet's "Create a backup first" row is for Pro lifters only, so the sheet never opens the Paywall. */
export function deleteSheetBackupShortcut(isPro: boolean): boolean {
  return isPro;
}
