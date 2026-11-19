import { createStore } from "zustand/vanilla";

import type { SelectInsertDb } from "@/db/client";
import type { Unit } from "@/units";

import { readJumps, writeJump } from "./jumpSetting";
import { UNTOUCHED_JUMPS, type JumpKey, type SavedJumps } from "./jumps";

export interface JumpState {
  /** Each unit's Jumps as saved: kg, or null while the lifter has not changed one. `effectiveJumps` picks the current unit's. */
  saved: SavedJumps;
  /** Reads the saved Jumps from the database. Call once the migrations have run. */
  load: () => void;
  /** Saves one unit's Jump (kg) and updates every screen that reads the Jumps. The other unit's Jump is left alone. */
  setJump: (unit: Unit, key: JumpKey, kg: number) => void;
}

/** The Jumps as shared state, backed by the settings row. Untouched until `load` runs. */
export function createJumpStore(db: SelectInsertDb) {
  return createStore<JumpState>((set, get) => ({
    saved: UNTOUCHED_JUMPS,
    load: () => set({ saved: readJumps(db) }),
    setJump: (unit, key, kg) => {
      writeJump(db, unit, key, kg);
      const saved = get().saved;
      set({ saved: { ...saved, [unit]: { ...saved[unit], [key]: kg } } });
    },
  }));
}
