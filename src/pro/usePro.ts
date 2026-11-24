import { useStore } from "zustand";

import { db } from "@/db/client";

import { createProStore } from "./proStore";
import { noAnswerAdapter } from "./storeAdapter";

/** The app's one Pro store. Until ticket 04 lands the real adapter, the store never answers and the cached row decides. */
export const proStore = createProStore(db, noAnswerAdapter);

let proLoad: { error: Error | null } | null = null;

/**
 * Reads the cached Pro row into the store, once per app process. Call it once the migrations have run
 * and before any screen renders, so every screen draws with the last known Pro state and never waits on
 * the store (ADR 0004). Returns the error if the read failed. Safe to call on every render.
 */
export function loadProOnce(): Error | null {
  if (!proLoad) {
    try {
      proStore.getState().load();
      proLoad = { error: null };
    } catch (e) {
      proLoad = { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }
  return proLoad.error;
}

/** Whether this lifter has Pro, after the dev source. The one Pro check every feature reads (product rule 7). */
export function useIsPro(): boolean {
  return useStore(proStore, (s) => s.isPro);
}
