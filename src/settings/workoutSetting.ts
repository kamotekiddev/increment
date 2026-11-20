import type { SelectInsertDb } from "@/db/client";
import { userSettings } from "@/db/schema";
import { clampRest } from "@/routines/routineSetup";

/** The one settings row (shared with the unit and the Jumps). */
const ROW_ID = 1;

export interface WorkoutSettings {
  /** Seconds, a multiple of 15 from 15 to 600. */
  defaultRestS: number;
  showPreviousSet: boolean;
  keepScreenAwake: boolean;
}

/** The three Workout settings. Creates the settings row (90 s, on, on) the first time it is read. A stored Default rest out of range is repaired. */
export function readWorkoutSettings(q: SelectInsertDb): WorkoutSettings {
  q.insert(userSettings).values({ id: ROW_ID }).onConflictDoNothing().run();
  const row = q.select().from(userSettings).get();
  return {
    defaultRestS: clampRest(row?.defaultRestS ?? 90),
    showPreviousSet: row?.showPreviousSet ?? true,
    keepScreenAwake: row?.keepScreenAwake ?? true,
  };
}

function write(q: SelectInsertDb, set: Partial<typeof userSettings.$inferInsert>): void {
  q.insert(userSettings).values({ id: ROW_ID, ...set }).onConflictDoUpdate({ target: userSettings.id, set }).run();
}

/** Saves the Default rest in seconds. Touches only that column. */
export const writeDefaultRest = (q: SelectInsertDb, seconds: number): void => write(q, { defaultRestS: clampRest(seconds) });

/** Saves Show previous set. Touches only that column. */
export const writeShowPreviousSet = (q: SelectInsertDb, on: boolean): void => write(q, { showPreviousSet: on });

/** Saves Keep screen awake. Touches only that column. */
export const writeKeepScreenAwake = (q: SelectInsertDb, on: boolean): void => write(q, { keepScreenAwake: on });
