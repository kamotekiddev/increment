/** Rounding to multiples of the Jump. The tolerance and the round-down are shared with `src/units` (`src/grid`). */

import { cleanGrid, floorToMultiple, GRID_EPS } from "../grid";

export { floorToMultiple };

export function sameWeight(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-6;
}

/** The first multiple of `jump` strictly above `w`, so a step up is never a no-op. */
export function nextMultipleAbove(w: number, jump: number): number {
  return cleanGrid((Math.floor(w / jump + GRID_EPS) + 1) * jump);
}

/**
 * A weight from the other unit put on `jump`'s grid: the largest multiple of `jump` at or below `w` (62.5 kg on a
 * 5 lb grid is 135 lb, not 140). A weight already on the grid comes back unchanged (not re-derived), so a stored
 * Target keeps comparing equal to itself, and one a float hair below a multiple (135 lb is 26.999999999999996 steps
 * of 5 lb in kg) stays on it rather than dropping a whole step.
 */
export function snapDown(w: number, jump: number): number {
  const q = w / jump;
  if (Math.abs(q - Math.round(q)) < GRID_EPS) return w;
  return floorToMultiple(w, jump);
}
