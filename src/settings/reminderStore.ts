import { createStore } from "zustand/vanilla";

import type { SelectInsertDb } from "@/db/client";

import { readReminderSettings, writeRemindersOn, writeReminderTime, type ReminderSettings } from "./reminderSetting";

export interface ReminderState extends ReminderSettings {
  /** Reads the saved Reminder settings from the database. Call once the migrations have run. */
  load: () => void;
  /** Each setter saves at once and updates every screen that reads the setting. */
  setRemindersOn: (on: boolean) => void;
  setReminderTime: (minutes: number) => void;
}

/** The Reminder settings as shared state, backed by the settings row. The defaults until `load` runs. */
export function createReminderStore(db: SelectInsertDb) {
  return createStore<ReminderState>((set) => ({
    remindersOn: false,
    reminderTimeMin: 1080,
    load: () => set(readReminderSettings(db)),
    setRemindersOn: (on) => {
      writeRemindersOn(db, on);
      set({ remindersOn: on });
    },
    setReminderTime: (minutes) => {
      writeReminderTime(db, minutes);
      set({ reminderTimeMin: readReminderSettings(db).reminderTimeMin });
    },
  }));
}
