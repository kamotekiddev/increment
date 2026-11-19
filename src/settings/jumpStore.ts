import { createStore } from "zustand/vanilla";

import type { SelectInsertDb } from "@/db/client";

import { readJumps, writeJump } from "./jumpSetting";
import { UNTOUCHED_JUMPS, type JumpKey, type SavedJumps } from "./jumps";

export interface JumpState {
  /** The Jumps as saved: kg, or null while the lifter has not changed one. `effectiveJumps` shows them in the current unit. */
  saved: SavedJumps;
  /** Reads the saved Jumps from the database. Call once the migrations have run. */
  load: () => void;
  /** Saves one Jump (kg) and updates every screen that reads the Jumps. */
  setJump: (key: JumpKey, kg: number) => void;
}

/** The Jumps as shared state, backed by the settings row. Untouched until `load` runs. */
export function createJumpStore(db: SelectInsertDb) {
  return createStore<JumpState>((set, get) => ({
    saved: UNTOUCHED_JUMPS,
    load: () => set({ saved: readJumps(db) }),
    setJump: (key, kg) => {
      writeJump(db, key, kg);
      set({ saved: { ...get().saved, [key]: kg } });
    },
  }));
}
