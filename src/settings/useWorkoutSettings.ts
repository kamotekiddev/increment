import { useStore } from "zustand";

import { db } from "@/db/client";

import { createWorkoutStore } from "./workoutStore";

export const workoutStore = createWorkoutStore(db);

let workoutLoad: { error: Error | null } | null = null;

/**
 * Reads the saved Workout settings into the store, once per app process. Call it once the migrations have
 * run and before any screen renders. Returns the error if the read failed. Safe to call on every render.
 */
export function loadWorkoutSettingsOnce(): Error | null {
  if (!workoutLoad) {
    try {
      workoutStore.getState().load();
      workoutLoad = { error: null };
    } catch (e) {
      workoutLoad = { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }
  return workoutLoad.error;
}

/** The Default rest in seconds (15 to 600, 90 until changed) and a setter. Screens re-render when it changes. */
export function useDefaultRest(): { defaultRestS: number; setDefaultRest: (seconds: number) => void } {
  const defaultRestS = useStore(workoutStore, (s) => s.defaultRestS);
  const setDefaultRest = useStore(workoutStore, (s) => s.setDefaultRest);
  return { defaultRestS, setDefaultRest };
}

/** Whether the live workout shows the Last column (on until changed), and a setter. */
export function useShowPreviousSet(): { showPreviousSet: boolean; setShowPreviousSet: (on: boolean) => void } {
  const showPreviousSet = useStore(workoutStore, (s) => s.showPreviousSet);
  const setShowPreviousSet = useStore(workoutStore, (s) => s.setShowPreviousSet);
  return { showPreviousSet, setShowPreviousSet };
}

/** Whether the live workout keeps the screen lit (on until changed), and a setter. */
export function useKeepScreenAwake(): { keepScreenAwake: boolean; setKeepScreenAwake: (on: boolean) => void } {
  const keepScreenAwake = useStore(workoutStore, (s) => s.keepScreenAwake);
  const setKeepScreenAwake = useStore(workoutStore, (s) => s.setKeepScreenAwake);
  return { keepScreenAwake, setKeepScreenAwake };
}
