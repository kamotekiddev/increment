import { useStore } from "zustand";

import { db } from "@/db/client";

import { createJumpStore } from "./jumpStore";
import type { JumpKey, Jumps } from "./jumps";

export const jumpStore = createJumpStore(db);

let jumpLoad: { error: Error | null } | null = null;

/**
 * Reads the saved Jumps into the store, once per app process. Call it once the migrations have run and
 * before any screen renders, so the first Target uses the saved Jumps. Returns the error if the read
 * failed. Safe to call on every render: a remount or StrictMode never repeats it.
 */
export function loadJumpsOnce(): Error | null {
  if (!jumpLoad) {
    try {
      jumpStore.getState().load();
      jumpLoad = { error: null };
    } catch (e) {
      jumpLoad = { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }
  return jumpLoad.error;
}

/** The Jumps in kg, one per equipment group, and a setter. Screens re-render when one changes. */
export function useJumps(): { jumps: Jumps; setJump: (key: JumpKey, kg: number) => void } {
  const jumps = useStore(jumpStore, (s) => s.jumps);
  const setJump = useStore(jumpStore, (s) => s.setJump);
  return { jumps, setJump };
}
