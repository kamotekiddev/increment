import type { PastExercise } from "./historyInputs";

export interface LastSet {
  weightKg: number;
  reps: number;
}

/**
 * The read-only Last column: for each of `rowCount` rows, the done set at the same position in the
 * last finished workout, or null (shown as "–") when there is none, as for an added set.
 */
export function lastColumn(last: PastExercise | null, rowCount: number): (LastSet | null)[] {
  const byIdx = [...(last?.sets ?? [])].sort((a, b) => a.idx - b.idx).filter((s) => !s.isWarmup);
  return Array.from({ length: rowCount }, (_, i) => {
    const set = byIdx[i];
    return set && set.done ? { weightKg: set.weightKg, reps: set.reps } : null;
  });
}
