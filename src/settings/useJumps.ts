import { useCallback, useMemo } from "react";
import { useStore } from "zustand";

import { db } from "@/db/client";

import { createJumpStore } from "./jumpStore";
import { effectiveJumps, type JumpKey, type Jumps } from "./jumps";
import { useUnit } from "./useUnit";

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

/**
 * The current unit's Jumps in kg, one per equipment group, and a setter that saves into the current unit only.
 * Each unit keeps its own Jumps; an untouched one is that unit's default (5 lb for a lb lifter's Barbell).
 * Screens re-render when a Jump or the unit changes.
 */
export function useJumps(): { jumps: Jumps; setJump: (key: JumpKey, kg: number) => void } {
  const saved = useStore(jumpStore, (s) => s.saved);
  const setUnitJump = useStore(jumpStore, (s) => s.setJump);
  const { unit } = useUnit();
  const jumps = useMemo(() => effectiveJumps(saved, unit), [saved, unit]);
  const setJump = useCallback((key: JumpKey, kg: number) => setUnitJump(unit, key, kg), [setUnitJump, unit]);
  return { jumps, setJump };
}
