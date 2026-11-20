import type { LoadType } from "../engine";
import { formatWeight, type Unit } from "../units";
import type { PastExercise } from "./historyInputs";
import { repsText } from "./repsText";

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

export type SetRowColumn = "set" | "last" | "weight" | "reps" | "check";

/**
 * The columns of a live-workout set row, left to right. The Last column is dropped when Show previous set is off;
 * a bodyweight exercise has no weight box.
 */
export function setRowColumns(loadType: LoadType, showPreviousSet: boolean): SetRowColumn[] {
  const columns: SetRowColumn[] = ["set"];
  if (showPreviousSet) columns.push("last");
  if (loadType !== "bodyweight") columns.push("weight");
  columns.push("reps", "check");
  return columns;
}

/**
 * One cell of the Last column: "60 × 8" in the unit on screen, or "–". A bodyweight exercise has no
 * weight, so it shows reps only, even for a set logged with added weight before the split.
 */
export function lastSetText(set: LastSet | null, unit: Unit, loadType: LoadType): string {
  if (!set) return "–";
  if (loadType === "bodyweight") return repsText(set.reps);
  return `${formatWeight(set.weightKg, unit)} × ${set.reps}`;
}
