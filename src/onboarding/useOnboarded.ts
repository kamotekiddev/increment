import { useStore } from "zustand";

import { db } from "@/db/client";

import { createOnboardingStore } from "./onboardingStore";

export const onboardingStore = createOnboardingStore(db);

let onboardedLoad: { error: Error | null } | null = null;

/** Reads the flag into the store once per app process, with the other startup reads. Returns the error if the read failed. */
export function loadOnboardedOnce(): Error | null {
  if (!onboardedLoad) {
    try {
      onboardingStore.getState().load();
      onboardedLoad = { error: null };
    } catch (e) {
      onboardedLoad = { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }
  return onboardedLoad.error;
}

/** Whether onboarding is done. Screens re-render when it changes. */
export function useOnboarded(): boolean {
  return useStore(onboardingStore, (s) => s.onboarded);
}
