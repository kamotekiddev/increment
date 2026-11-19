import { createStore } from "zustand/vanilla";

import type { SelectInsertDb } from "@/db/client";

import { readJumps, writeJump } from "./jumpSetting";
import { DEFAULT_JUMPS_KG, type JumpKey, type Jumps } from "./jumps";

export interface JumpState {
  /** Every Jump, in kg. */
  jumps: Jumps;
  /** Reads the saved Jumps from the database. Call once the migrations have run. */
  load: () => void;
  /** Saves one Jump (kg) and updates every screen that reads the Jumps. */
  setJump: (key: JumpKey, kg: number) => void;
}

/** The Jumps as shared state, backed by the settings row. The defaults until `load` runs. */
export function createJumpStore(db: SelectInsertDb) {
  return createStore<JumpState>((set, get) => ({
    jumps: DEFAULT_JUMPS_KG,
    load: () => set({ jumps: readJumps(db) }),
    setJump: (key, kg) => {
      writeJump(db, key, kg);
      set({ jumps: { ...get().jumps, [key]: kg } });
    },
  }));
}
