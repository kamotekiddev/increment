import type { Planned, Target } from "../engine";
import type { SetRow } from "./types";

/** The rows shown at Start: one per planned set, prefilled from the Target if there is one. */
export function initialSetRows(planned: Planned, target: Target | null): SetRow[] {
  const weightKg = target ? target.weightKg : null;
  const reps = target ? target.reps : planned.repMin;
  return Array.from({ length: planned.sets }, () => ({ weightKg, reps, done: false, edited: false }));
}
