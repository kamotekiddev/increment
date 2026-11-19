import { useMemo } from "react";
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
 * The Jumps in kg as shown in the current unit, one per equipment group, and a setter that saves a Jump in kg.
 * A saved Jump shows as the nearest rung of the unit's ladder (5 kg is 10 lb); an untouched one is the unit's
 * default (5 lb for an lb lifter's Barbell). Screens re-render when a Jump or the unit changes.
 */
export function useJumps(): { jumps: Jumps; setJump: (key: JumpKey, kg: number) => void } {
  const saved = useStore(jumpStore, (s) => s.saved);
  const setJump = useStore(jumpStore, (s) => s.setJump);
  const { unit } = useUnit();
  const jumps = useMemo(() => effectiveJumps(saved, unit), [saved, unit]);
  return { jumps, setJump };
}
