/** The − / + on the Weight jumps screen. Pure: works in the lifter's unit and returns kg. */

import { fromKg, toKg, type Unit } from "@/units";

/**
 * The values − and + move through, one ladder per unit, in that unit. Only steps real plates make:
 * kg 0.5, 1, 1.25, 2, 2.5, 5, 10 and lb 1.25, 2.5, 5, 10, 15, 20. The bottom rung is the smallest Jump, never 0.
 */
export const JUMP_LADDER: Record<Unit, readonly number[]> = {
  kg: [0.5, 1, 1.25, 2, 2.5, 5, 10],
  lb: [1.25, 2.5, 5, 10, 15, 20],
};

/** One tap of − or +. */
export type JumpDirection = "up" | "down";

/** Absorbs float noise from converting kg to lb and back, so 5 lb stays on the 5 lb rung. */
const EPSILON = 1e-9;

/** The rung strictly above or below, in the lifter's unit, or undefined past the end of the ladder. */
function nextRung(kg: number, unit: Unit, direction: JumpDirection): number | undefined {
  const value = fromKg(kg, unit);
  const rungs = JUMP_LADDER[unit];
  if (direction === "up") return rungs.find((r) => r > value + EPSILON);
  const below = rungs.filter((r) => r < value - EPSILON);
  return below[below.length - 1];
}

/** Whether − (down) or + (up) can move this Jump without leaving the ladder. */
export function canStepJump(kg: number, unit: Unit, direction: JumpDirection): boolean {
  return nextRung(kg, unit, direction) !== undefined;
}

/**
 * The Jump in kg after one tap of − or +. It moves to the next rung of the ladder strictly above or
 * below, so a Jump that is off the ladder (5.51 lb) lands on it (10 lb up, 5 lb down). At either end it
 * returns the Jump unchanged.
 */
export function stepJump(kg: number, unit: Unit, direction: JumpDirection): number {
  const rung = nextRung(kg, unit, direction);
  return rung === undefined ? kg : toKg(rung, unit);
}
