/** The Jump settings: the smallest weight a lifter can add, one per equipment group and unit, in kg. Pure. */

import { toKg, type Unit } from "@/units";

/** One Jump per equipment group. `bodyweight` is the added weight on a weighted bodyweight exercise (belt, vest). */
export type JumpKey = "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight";

/** Every Jump, in kg: what the engine steps by. */
export type Jumps = Record<JumpKey, number>;

/** One unit's Jumps as saved: kg once the lifter has changed one, null while it is untouched. */
export type SavedUnitJumps = Record<JumpKey, number | null>;

/** The Jumps as saved: each unit keeps its own five, both in kg. A 5 lb Jump is saved as 2.26796185 under `lb`. */
export type SavedJumps = Record<Unit, SavedUnitJumps>;

export const JUMP_KEYS: readonly JumpKey[] = ["barbell", "dumbbell", "machine", "cable", "bodyweight"];

const UNTOUCHED_UNIT: SavedUnitJumps = { barbell: null, dumbbell: null, machine: null, cable: null, bodyweight: null };

/** A lifter who has never changed a Jump, in either unit. */
export const UNTOUCHED_JUMPS: SavedJumps = { kg: UNTOUCHED_UNIT, lb: UNTOUCHED_UNIT };

/** The Jump of an untouched row, in the lifter's unit (not kg), so every default is loadable in that unit. */
export const DEFAULT_JUMPS: Record<Unit, Record<JumpKey, number>> = {
  kg: { barbell: 2.5, dumbbell: 2, machine: 5, cable: 2.5, bodyweight: 2.5 },
  lb: { barbell: 5, dumbbell: 5, machine: 10, cable: 5, bodyweight: 5 },
};

/**
 * The Jumps the engine uses, in kg: the current unit's saved Jump, or that unit's default while untouched.
 * The other unit's Jumps are never read, so a Jump set in kg never shows up in lb.
 */
export function effectiveJumps(saved: SavedJumps, unit: Unit): Jumps {
  return Object.fromEntries(JUMP_KEYS.map((key) => [key, saved[unit][key] ?? toKg(DEFAULT_JUMPS[unit][key], unit)])) as Jumps;
}

/** A kg lifter's Jumps before they change any. */
export const DEFAULT_JUMPS_KG: Jumps = effectiveJumps(UNTOUCHED_JUMPS, "kg");

const KEY_BY_EQUIPMENT: Record<string, JumpKey> = {
  barbell: "barbell",
  "ez bar": "barbell",
  dumbbell: "dumbbell",
  kettlebell: "dumbbell",
  machine: "machine",
  cable: "cable",
  bodyweight: "bodyweight",
};

/** Which Jump an exercise's equipment uses. Equipment outside the library's seven values uses the Barbell Jump. */
export function jumpKeyFor(equipment: string): JumpKey {
  return KEY_BY_EQUIPMENT[equipment] ?? "barbell";
}

/** The Jump in kg for an exercise's equipment: what the caller passes the engine as `jumpKg`. */
export function jumpKgFor(equipment: string, jumps: Jumps): number {
  return jumps[jumpKeyFor(equipment)];
}
