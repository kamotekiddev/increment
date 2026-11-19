/** The − / + on the Weight jumps screen. Pure: works in the lifter's unit and returns kg. */

import { fromKg, toKg, type Unit } from "@/units";

/** The fine rungs at the bottom of the ladder; above the last one it climbs by 0.5. */
const FINE_RUNGS = [0.5, 1, 1.25, 1.5, 2, 2.5, 3];
const COARSE_STEP = 0.5;

/** The largest Jump + reaches, in the lifter's unit. The smallest is the first rung, never 0. */
const JUMP_MAX: Record<Unit, number> = { kg: 25, lb: 50 };

function ladder(max: number): readonly number[] {
  const rungs = [...FINE_RUNGS];
  for (let v = FINE_RUNGS[FINE_RUNGS.length - 1] + COARSE_STEP; v <= max; v += COARSE_STEP) rungs.push(v);
  return rungs;
}

/**
 * The values − and + move through, in the lifter's unit: 0.5, 1, 1.25, 1.5, 2, 2.5, 3, then every 0.5
 * up to 25 kg or 50 lb. The same rungs in kg and lb.
 */
export const JUMP_LADDER: Record<Unit, readonly number[]> = { kg: ladder(JUMP_MAX.kg), lb: ladder(JUMP_MAX.lb) };

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
 * below, so a Jump that is off the ladder (2.5 kg shown as 5.51 lb) lands on it. At either end it
 * returns the Jump unchanged.
 */
export function stepJump(kg: number, unit: Unit, direction: JumpDirection): number {
  const rung = nextRung(kg, unit, direction);
  return rung === undefined ? kg : toKg(rung, unit);
}
