/** The Jump settings: the smallest weight a lifter can add, one per equipment group, in kg. Pure. */

import { toKg, type Unit } from "@/units";

import { snapJump } from "./jumpStep";

/** One Jump per equipment group. `bodyweight` is the added weight on a weighted bodyweight exercise (belt, vest). */
export type JumpKey = "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight";

/** Every Jump, in kg: what the engine steps by. */
export type Jumps = Record<JumpKey, number>;

/**
 * The Jumps as saved, one per equipment group whichever unit set it: kg once the lifter has changed one
 * (15 lb is saved as 6.80388555), null while it is untouched.
 */
export type SavedJumps = Record<JumpKey, number | null>;

export const JUMP_KEYS: readonly JumpKey[] = ["barbell", "dumbbell", "machine", "cable", "bodyweight"];

/** A lifter who has never changed a Jump. */
export const UNTOUCHED_JUMPS: SavedJumps = { barbell: null, dumbbell: null, machine: null, cable: null, bodyweight: null };

/** The Jump of an untouched row, in the lifter's unit (not kg), so every default is loadable in that unit. */
export const DEFAULT_JUMPS: Record<Unit, Record<JumpKey, number>> = {
  kg: { barbell: 2.5, dumbbell: 2, machine: 5, cable: 2.5, bodyweight: 2.5 },
  lb: { barbell: 5, dumbbell: 5, machine: 10, cable: 5, bodyweight: 5 },
};

/**
 * The Jumps the engine uses, in kg: each saved Jump as shown in the current unit, the nearest rung of that
 * unit's ladder (5 kg is 10 lb in lb, and back in kg it is 5 kg again), or the unit's default while untouched.
 * Pure: switching unit never writes a Jump.
 */
export function effectiveJumps(saved: SavedJumps, unit: Unit): Jumps {
  return Object.fromEntries(
    JUMP_KEYS.map((key) => {
      const kg = saved[key];
      return [key, kg === null ? toKg(DEFAULT_JUMPS[unit][key], unit) : snapJump(kg, unit)];
    }),
  ) as Jumps;
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
