import { createStore } from "zustand/vanilla";

import type { Db } from "@/db/client";

import { finishOnboarding, isOnboarded } from "./onboarding";

export interface OnboardingState {
  onboarded: boolean;
  /** Reads the flag from the database. Call once the migrations have run. Writes nothing. */
  load: () => void;
  /** Sets the flag only (Restore from Welcome) and updates every screen that reads it. */
  finish: () => void;
}

/** Whether onboarding is done, as shared state the root layout's gate follows. False until `load` runs. */
export function createOnboardingStore(db: Db) {
  return createStore<OnboardingState>((set) => ({
    onboarded: false,
    load: () => set({ onboarded: isOnboarded(db) }),
    finish: () => {
      finishOnboarding(db);
      set({ onboarded: true });
    },
  }));
}
