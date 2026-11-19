/** The − / + on the Weight jumps screen. Pure: works in the lifter's unit and returns kg. */

import { fromKg, toKg, type Unit } from "@/units";

/** How far one tap moves a Jump, in the lifter's unit. */
export const JUMP_STEP: Record<Unit, number> = { kg: 0.5, lb: 0.5 };

/** The smallest and largest Jump − and + reach, in the lifter's unit. The smallest is one step, never 0. */
export const JUMP_BOUNDS: Record<Unit, { min: number; max: number }> = {
  kg: { min: 0.5, max: 25 },
  lb: { min: 0.5, max: 50 },
};

/** One tap of − or +. */
export type JumpDirection = "up" | "down";

/** Absorbs float noise from converting kg to lb and back, so 5 lb stays on the 5 lb grid line. */
const EPSILON = 1e-9;

/** The next value on the unit's grid strictly above or below, in the lifter's unit. */
function nextOnGrid(kg: number, unit: Unit, direction: JumpDirection): number {
  const step = JUMP_STEP[unit];
  const n = fromKg(kg, unit) / step;
  const k = direction === "up" ? Math.floor(n + EPSILON) + 1 : Math.ceil(n - EPSILON) - 1;
  return k * step;
}

/** Whether − (down) or + (up) can move this Jump without leaving the bounds. */
export function canStepJump(kg: number, unit: Unit, direction: JumpDirection): boolean {
  const next = nextOnGrid(kg, unit, direction);
  const { min, max } = JUMP_BOUNDS[unit];
  return next >= min - EPSILON && next <= max + EPSILON;
}

/**
 * The Jump in kg after one tap of − or +. It moves to the next value on the unit's grid (multiples of
 * the step) strictly above or below, so a Jump that is off the grid (2.5 kg shown as 5.51 lb) lands on
 * it. At a bound it returns the Jump unchanged.
 */
export function stepJump(kg: number, unit: Unit, direction: JumpDirection): number {
  if (!canStepJump(kg, unit, direction)) return kg;
  return toKg(nextOnGrid(kg, unit, direction), unit);
}
