import { useStore } from "zustand";

import { db } from "@/db/client";

import { createReminderStore } from "./reminderStore";

export const reminderStore = createReminderStore(db);

let reminderLoad: { error: Error | null } | null = null;

/** Reads the saved Reminder settings into the store, once per app process. Call it once the migrations have run. Returns the error if the read failed. */
export function loadReminderSettingsOnce(): Error | null {
  if (!reminderLoad) {
    try {
      reminderStore.getState().load();
      reminderLoad = { error: null };
    } catch (e) {
      reminderLoad = { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }
  return reminderLoad.error;
}

/** Whether Training day reminders is on (off until changed), and a setter. */
export function useRemindersOn(): { remindersOn: boolean; setRemindersOn: (on: boolean) => void } {
  const remindersOn = useStore(reminderStore, (s) => s.remindersOn);
  const setRemindersOn = useStore(reminderStore, (s) => s.setRemindersOn);
  return { remindersOn, setRemindersOn };
}

/** The Reminder time in minutes after midnight (1080 = 6:00 PM until changed), and a setter. */
export function useReminderTime(): { reminderTimeMin: number; setReminderTime: (minutes: number) => void } {
  const reminderTimeMin = useStore(reminderStore, (s) => s.reminderTimeMin);
  const setReminderTime = useStore(reminderStore, (s) => s.setReminderTime);
  return { reminderTimeMin, setReminderTime };
}
