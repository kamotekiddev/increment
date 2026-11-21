/**
 * Pure: multiples of a step (the Jump's grid). The engine (Targets) and `src/units` (pre-filled rows, the Last
 * column) both round down here, so the banner and the rows can never disagree. Neither imports the other, so this
 * leaf holds the one tolerance both use.
 */

/**
 * How far a quotient may sit below a whole number and still count as on it. Absorbs float error from conversions
 * (5 lb = 2.26796185 kg; 135 lb is 26.999999999999996 steps of 5 lb in kg); realistic weights stay far below the
 * point where it would matter.
 */
export const GRID_EPS = 1e-9;

/** Rounds away float noise from multiplying by a step (3 × 0.1 is 0.3, not 0.30000000000000004). */
export function cleanGrid(n: number): number {
  return Number(n.toFixed(10));
}

/** The largest multiple of `step` at or below `w`, a float hair below a multiple counting as on it. Never negative. */
export function floorToMultiple(w: number, step: number): number {
  return cleanGrid(Math.max(0, Math.floor(w / step + GRID_EPS) * step));
}
