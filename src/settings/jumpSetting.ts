import type { SelectInsertDb } from "@/db/client";
import { userSettings } from "@/db/schema";
import type { Unit } from "@/units";

import { UNTOUCHED_JUMPS, type JumpKey, type SavedJumps } from "./jumps";

/** The one settings row (shared with the unit). */
const ROW_ID = 1;

type JumpColumn =
  | "jumpBarbellKg"
  | "jumpDumbbellKg"
  | "jumpMachineKg"
  | "jumpCableKg"
  | "jumpBodyweightKg"
  | "jumpLbBarbellKg"
  | "jumpLbDumbbellKg"
  | "jumpLbMachineKg"
  | "jumpLbCableKg"
  | "jumpLbBodyweightKg";

/** Each unit's Jumps live in their own five columns, all in kg. */
const COLUMN: Record<Unit, Record<JumpKey, JumpColumn>> = {
  kg: {
    barbell: "jumpBarbellKg",
    dumbbell: "jumpDumbbellKg",
    machine: "jumpMachineKg",
    cable: "jumpCableKg",
    bodyweight: "jumpBodyweightKg",
  },
  lb: {
    barbell: "jumpLbBarbellKg",
    dumbbell: "jumpLbDumbbellKg",
    machine: "jumpLbMachineKg",
    cable: "jumpLbCableKg",
    bodyweight: "jumpLbBodyweightKg",
  },
};

/** The saved Jumps of both units in kg, null where the lifter never changed one. Creates the settings row the first time it is read. */
export function readJumps(q: SelectInsertDb): SavedJumps {
  q.insert(userSettings).values({ id: ROW_ID }).onConflictDoNothing().run();
  const row = q.select().from(userSettings).get();
  if (!row) return UNTOUCHED_JUMPS;
  const unitJumps = (unit: Unit) => {
    const c = COLUMN[unit];
    return { barbell: row[c.barbell], dumbbell: row[c.dumbbell], machine: row[c.machine], cable: row[c.cable], bodyweight: row[c.bodyweight] };
  };
  return { kg: unitJumps("kg"), lb: unitJumps("lb") };
}

/** Saves one unit's Jump in kg, at full precision. Touches only that column: the other unit's Jump stays as it is. */
export function writeJump(q: SelectInsertDb, unit: Unit, key: JumpKey, kg: number): void {
  const set = { [COLUMN[unit][key]]: kg };
  q.insert(userSettings).values({ id: ROW_ID, ...set }).onConflictDoUpdate({ target: userSettings.id, set }).run();
}
