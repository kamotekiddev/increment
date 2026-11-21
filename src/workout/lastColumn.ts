import type { LoadType } from "../engine";
import { formatNumber, loadableIn, type Unit, type Weight } from "../units";
import type { PastExercise } from "./historyInputs";
import { repsText } from "./repsText";

export interface LastSet {
  /** The weight as saved, in `unit`. */
  weight: number;
  unit: Unit;
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
    return set && set.done ? { weight: set.weight, unit: set.weightUnit, reps: set.reps } : null;
  });
}

/**
 * One cell of the Last column: "60 × 8" in the unit on screen, or "–". A set saved in that unit shows exactly; one
 * saved in the other unit is a weight to load, so it is converted and rounded to the Jump (`jumpKg`): 100 kg is
 * "220 × 8" with a 5 lb Jump. A bodyweight exercise has no weight, so it shows reps only, even for a set logged
 * with added weight before the split.
 */
export function lastSetText(set: LastSet | null, unit: Unit, loadType: LoadType, jumpKg: number): string {
  if (!set) return "–";
  if (loadType === "bodyweight") return repsText(set.reps);
  const saved: Weight = { value: set.weight, unit: set.unit };
  return `${formatNumber(loadableIn(saved, unit, jumpKg))} × ${set.reps}`;
}
