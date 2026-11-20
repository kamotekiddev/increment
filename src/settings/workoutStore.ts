import { createStore } from "zustand/vanilla";

import type { SelectInsertDb } from "@/db/client";

import {
  readWorkoutSettings,
  writeDefaultRest,
  writeKeepScreenAwake,
  writeShowPreviousSet,
  type WorkoutSettings,
} from "./workoutSetting";

export interface WorkoutState extends WorkoutSettings {
  /** Reads the saved Workout settings from the database. Call once the migrations have run. */
  load: () => void;
  /** Each setter saves at once and updates every screen that reads the setting. */
  setDefaultRest: (seconds: number) => void;
  setShowPreviousSet: (on: boolean) => void;
  setKeepScreenAwake: (on: boolean) => void;
}

/** The Workout settings as shared state, backed by the settings row. The defaults until `load` runs. */
export function createWorkoutStore(db: SelectInsertDb) {
  return createStore<WorkoutState>((set) => ({
    defaultRestS: 90,
    showPreviousSet: true,
    keepScreenAwake: true,
    load: () => set(readWorkoutSettings(db)),
    setDefaultRest: (seconds) => {
      writeDefaultRest(db, seconds);
      set({ defaultRestS: readWorkoutSettings(db).defaultRestS });
    },
    setShowPreviousSet: (on) => {
      writeShowPreviousSet(db, on);
      set({ showPreviousSet: on });
    },
    setKeepScreenAwake: (on) => {
      writeKeepScreenAwake(db, on);
      set({ keepScreenAwake: on });
    },
  }));
}
