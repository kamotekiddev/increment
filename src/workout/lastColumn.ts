import type { PastExercise } from "./historyInputs";

export interface LastSet {
  weightKg: number;
  reps: number;
}

/**
 * The read-only Last column: for each of `rowCount` rows, the done set at the same plan position (idx; Finish leaves gaps) in the
 * last finished workout, or null (shown as "–") when there is none, as for an added set.
 */
export function lastColumn(last: PastExercise | null, rowCount: number): (LastSet | null)[] {
  const working = (last?.sets ?? []).filter((s) => !s.isWarmup);
  return Array.from({ length: rowCount }, (_, i) => {
    const set = working.find((s) => s.idx === i);
    return set && set.done ? { weightKg: set.weightKg, reps: set.reps } : null;
  });
}
