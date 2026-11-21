import type { Planned, Target } from "../engine";
import { kgIn, type Unit } from "../units";
import type { SetRow } from "./types";

/**
 * The rows shown at Start: one per planned set, prefilled from the Target in the lifter's `unit`. The engine
 * has already put the Target on the Jump's grid, so the pre-fill is only converted (62.5 kg, 135 lb), never
 * rounded again: a Target set in this unit stays as it is.
 */
export function initialSetRows(planned: Planned, target: Target | null, unit: Unit): SetRow[] {
  const weight = target ? kgIn(target.weightKg, unit) : null;
  const reps = target ? target.reps : planned.repMin;
  return Array.from({ length: planned.sets }, () => ({ weight, unit, reps, done: false, edited: false }));
}
