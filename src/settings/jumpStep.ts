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

/** Absorbs float noise from converting kg to lb and back, so a Jump halfway between two rungs goes up. */
const EPSILON = 1e-9;

/**
 * The rung of the unit's ladder nearest to a Jump, in that unit; a tie goes to the higher rung. A Jump set in
 * the other unit lands on a real step here: 5 kg (11.02 lb) is 10 lb, 2 kg (4.41 lb) is 5 lb.
 */
function nearestRung(kg: number, unit: Unit): number {
  const value = fromKg(kg, unit);
  let best = JUMP_LADDER[unit][0];
  for (const rung of JUMP_LADDER[unit]) {
    if (Math.abs(rung - value) <= Math.abs(best - value) + EPSILON) best = rung;
  }
  return best;
}

/** The Jump as shown in the unit, in kg: the nearest rung, so the engine steps by what the lifter sees. */
export function snapJump(kg: number, unit: Unit): number {
  return toKg(nearestRung(kg, unit), unit);
}

/** The rung above or below the one shown, in the lifter's unit, or undefined past the end of the ladder. */
function nextRung(kg: number, unit: Unit, direction: JumpDirection): number | undefined {
  const rungs = JUMP_LADDER[unit];
  return rungs[rungs.indexOf(nearestRung(kg, unit)) + (direction === "up" ? 1 : -1)];
}

/** Whether − (down) or + (up) can move this Jump without leaving the ladder. */
export function canStepJump(kg: number, unit: Unit, direction: JumpDirection): boolean {
  return nextRung(kg, unit, direction) !== undefined;
}

/**
 * The Jump in kg after one tap of − or +: one rung above or below the shown rung, saved in kg. In lb, a saved
 * 5 kg shows as 10 lb, and + gives 15 lb (6.80388555 kg). At either end it returns the shown Jump.
 */
export function stepJump(kg: number, unit: Unit, direction: JumpDirection): number {
  const rung = nextRung(kg, unit, direction);
  return rung === undefined ? snapJump(kg, unit) : toKg(rung, unit);
}
