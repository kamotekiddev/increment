import type { SelectInsertDb } from "@/db/client";
import { userSettings } from "@/db/schema";

import { UNTOUCHED_JUMPS, type JumpKey, type SavedJumps } from "./jumps";

/** The one settings row (shared with the unit). */
const ROW_ID = 1;

const COLUMN: Record<JumpKey, "jumpBarbellKg" | "jumpDumbbellKg" | "jumpMachineKg" | "jumpCableKg" | "jumpBodyweightKg"> = {
  barbell: "jumpBarbellKg",
  dumbbell: "jumpDumbbellKg",
  machine: "jumpMachineKg",
  cable: "jumpCableKg",
  bodyweight: "jumpBodyweightKg",
};

/** The saved Jumps in kg, null where the lifter never changed one. Creates the settings row the first time it is read. */
export function readJumps(q: SelectInsertDb): SavedJumps {
  q.insert(userSettings).values({ id: ROW_ID }).onConflictDoNothing().run();
  const row = q.select().from(userSettings).get();
  if (!row) return { ...UNTOUCHED_JUMPS };
  return {
    barbell: row.jumpBarbellKg,
    dumbbell: row.jumpDumbbellKg,
    machine: row.jumpMachineKg,
    cable: row.jumpCableKg,
    bodyweight: row.jumpBodyweightKg,
  };
}

/** Saves one Jump in kg, at full precision. Touches only that column of the settings row. */
export function writeJump(q: SelectInsertDb, key: JumpKey, kg: number): void {
  const set = { [COLUMN[key]]: kg };
  q.insert(userSettings).values({ id: ROW_ID, ...set }).onConflictDoUpdate({ target: userSettings.id, set }).run();
}
