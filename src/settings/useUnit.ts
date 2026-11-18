import { useStore } from "zustand";

import { db } from "@/db/client";
import type { Unit } from "@/units";

import { createUnitStore } from "./unitStore";

export const unitStore = createUnitStore(db);

let unitLoad: { error: Error | null } | null = null;

/**
 * Reads the saved unit into the store, once per app process. Call it once the migrations have run and
 * before any screen renders, so every screen starts with the saved unit (no flash of kg). Returns the
 * error if the read failed. Safe to call on every render: a remount or StrictMode never repeats it.
 */
export function loadUnitOnce(): Error | null {
  if (!unitLoad) {
    try {
      unitStore.getState().load();
      unitLoad = { error: null };
    } catch (e) {
      unitLoad = { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }
  return unitLoad.error;
}

/** The unit every weight is shown and typed in, and a setter. Screens re-render when it changes. */
export function useUnit(): { unit: Unit; setUnit: (unit: Unit) => void } {
  const unit = useStore(unitStore, (s) => s.unit);
  const setUnit = useStore(unitStore, (s) => s.setUnit);
  return { unit, setUnit };
}
