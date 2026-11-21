import type { LoggedSet } from "../engine";
import { weightKg } from "../units";
import type { SetRow } from "./types";

/**
 * The sets the engine judges: done working sets among the first `plannedSets` rows.
 * A done row with a blank weight cannot be judged. Weights become kg in memory for the engine.
 */
export function judgedSets(rows: SetRow[], plannedSets: number): LoggedSet[] {
  const judged: LoggedSet[] = [];
  for (const row of rows.slice(0, plannedSets)) {
    if (row.done && row.weight !== null) {
      judged.push({ weightKg: weightKg({ value: row.weight, unit: row.unit }), reps: row.reps, done: true, isWarmup: false, unit: row.unit });
    }
  }
  return judged;
}
