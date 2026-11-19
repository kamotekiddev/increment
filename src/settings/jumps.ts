/** The Jump settings: the smallest weight a lifter can add, one per equipment group, in kg. Pure. */

/** One Jump per equipment group. `bodyweight` is the added weight on a weighted bodyweight exercise (belt, vest). */
export type JumpKey = "barbell" | "dumbbell" | "machine" | "cable" | "bodyweight";

/** Every Jump, in kg. */
export type Jumps = Record<JumpKey, number>;

export const JUMP_KEYS: readonly JumpKey[] = ["barbell", "dumbbell", "machine", "cable", "bodyweight"];

/** The Jumps before the lifter changes any. */
export const DEFAULT_JUMPS_KG: Jumps = { barbell: 2.5, dumbbell: 2, machine: 5, cable: 2.5, bodyweight: 2.5 };

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
