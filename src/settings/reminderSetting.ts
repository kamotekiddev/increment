import type { SelectInsertDb } from "@/db/client";
import { userSettings } from "@/db/schema";

/** The one settings row (shared with the unit and the Workout settings). */
const ROW_ID = 1;

export const DEFAULT_REMINDER_TIME_MIN = 1080;
const MAX_MINUTE = 1439;

export interface ReminderSettings {
  remindersOn: boolean;
  /** Minutes after local midnight, 0 to 1439. */
  reminderTimeMin: number;
}

function clampMinutes(min: number): number {
  return Math.min(MAX_MINUTE, Math.max(0, Math.round(min)));
}

/** The two Reminder settings. Creates the settings row (off, 6:00 PM) the first time it is read. A stored time out of range is repaired. */
export function readReminderSettings(q: SelectInsertDb): ReminderSettings {
  q.insert(userSettings).values({ id: ROW_ID }).onConflictDoNothing().run();
  const row = q.select().from(userSettings).get();
  return {
    remindersOn: row?.remindersOn ?? false,
    reminderTimeMin: clampMinutes(row?.reminderTimeMin ?? DEFAULT_REMINDER_TIME_MIN),
  };
}

function write(q: SelectInsertDb, set: Partial<typeof userSettings.$inferInsert>): void {
  q.insert(userSettings).values({ id: ROW_ID, ...set }).onConflictDoUpdate({ target: userSettings.id, set }).run();
}

/** Saves Training day reminders. Touches only that column. */
export const writeRemindersOn = (q: SelectInsertDb, on: boolean): void => write(q, { remindersOn: on });

/** Saves the Reminder time in minutes after midnight. Touches only that column. */
export const writeReminderTime = (q: SelectInsertDb, minutes: number): void => write(q, { reminderTimeMin: clampMinutes(minutes) });
