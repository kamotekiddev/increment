/** One set row on the live workout screen. Weights are kg. */
export interface SetRow {
  /** Null while blank (first workout with no Target). */
  weightKg: number | null;
  reps: number;
  done: boolean;
  /** The lifter typed or nudged this row themselves. Edited rows never follow. */
  edited: boolean;
}
