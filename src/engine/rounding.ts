/** Rounding to multiples of the Jump. A small epsilon on the quotient absorbs float error from lb-derived jumps (5 lb = 2.26796185 kg); realistic weights stay far below the point where it would matter. */

const EPS = 1e-9;

function clean(n: number): number {
  return Number(n.toFixed(10));
}

export function sameWeight(a: number, b: number): boolean {
  return Math.abs(a - b) < 1e-6;
}

/** The first multiple of `jump` strictly above `w`, so a step up is never a no-op. */
export function nextMultipleAbove(w: number, jump: number): number {
  return clean((Math.floor(w / jump + EPS) + 1) * jump);
}

/**
 * The nearest multiple of `jump` to `w`; an exact tie rounds up. A weight already on the grid comes
 * back unchanged (not re-derived), so a stored Target keeps comparing equal to itself.
 */
export function nearestMultiple(w: number, jump: number): number {
  const q = w / jump;
  if (Math.abs(q - Math.round(q)) < EPS) return w;
  return clean(Math.floor(q + 0.5 + EPS) * jump);
}

/** The largest multiple of `jump` at or below `w`. Never negative. */
export function floorToMultiple(w: number, jump: number): number {
  return clean(Math.max(0, Math.floor(w / jump + EPS) * jump));
}
