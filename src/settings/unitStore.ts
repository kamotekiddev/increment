import { createStore } from "zustand/vanilla";

import type { SelectInsertDb } from "@/db/client";
import type { Unit } from "@/units";

import { readUnit, writeUnit } from "./unitSetting";

export interface UnitState {
  unit: Unit;
  /** Reads the saved unit from the database. Call once the migrations have run. */
  load: () => void;
  /** Saves the unit and updates every screen that reads it. */
  setUnit: (unit: Unit) => void;
}

/** The unit as shared state, backed by the settings row. kg until `load` runs. */
export function createUnitStore(db: SelectInsertDb) {
  return createStore<UnitState>((set) => ({
    unit: "kg",
    load: () => set({ unit: readUnit(db) }),
    setUnit: (unit) => {
      writeUnit(db, unit);
      set({ unit });
    },
  }));
}
