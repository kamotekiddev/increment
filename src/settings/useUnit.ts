import { useStore } from "zustand";

import { db } from "@/db/client";
import type { Unit } from "@/units";

import { createUnitStore } from "./unitStore";

export const unitStore = createUnitStore(db);

/** Reads the saved unit into the store. `useDatabase` calls it once migrations succeed, before any screen renders. */
export function loadUnit(): void {
  unitStore.getState().load();
}

/** The unit every weight is shown and typed in, and a setter. Screens re-render when it changes. */
export function useUnit(): { unit: Unit; setUnit: (unit: Unit) => void } {
  const unit = useStore(unitStore, (s) => s.unit);
  const setUnit = useStore(unitStore, (s) => s.setUnit);
  return { unit, setUnit };
}
