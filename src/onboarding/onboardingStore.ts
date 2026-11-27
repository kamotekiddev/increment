import { createStore } from "zustand/vanilla";

import type { Db } from "@/db/client";

import type { Unit } from "@/units";

import { finishOnboarding, finishQuickStart, isOnboarded } from "./onboarding";

export interface OnboardingState {
  onboarded: boolean;
  /** Reads the flag from the database. Call once the migrations have run. Writes nothing. */
  load: () => void;
  /** Sets the flag only (Restore from Welcome) and updates every screen that reads it. */
  finish: () => void;
  /** Quick start's Start training: creates the Starter plan, saves the unit and the flag in one transaction, then reloads the unit store, refreshes reminders and updates every screen. Rethrows on failure and changes nothing. */
  finishQuickStart: (unit: Unit) => void;
}

/** What finishing Quick start must update beyond the flag: the cached unit and the notification schedule. */
export interface OnboardingEffects {
  /** The shared unit store (`unitStore`), whose cached unit the saved choice replaces. */
  unitStore: { getState: () => { load: () => void } };
  /** Reschedules the reminders for the new routines. Fire and forget. */
  refreshReminders: () => void;
}

/** Whether onboarding is done, as shared state the root layout's gate follows. False until `load` runs. */
export function createOnboardingStore(db: Db, effects: OnboardingEffects) {
  return createStore<OnboardingState>((set) => ({
    onboarded: false,
    load: () => set({ onboarded: isOnboarded(db) }),
    finish: () => {
      finishOnboarding(db);
      set({ onboarded: true });
    },
    finishQuickStart: (unit) => {
      finishQuickStart(db, unit);
      // The unit store cached kg at startup; reload it so the first workout shows the chosen unit.
      effects.unitStore.getState().load();
      effects.refreshReminders();
      set({ onboarded: true });
    },
  }));
}
