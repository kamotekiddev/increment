import type { LoggedSet } from "../engine";
import type { SetRow } from "./types";

/**
 * The sets the engine judges: done working sets among the first `plannedSets` rows.
 * A done row with a blank weight cannot be judged.
 */
export function judgedSets(rows: SetRow[], plannedSets: number): LoggedSet[] {
  const judged: LoggedSet[] = [];
  for (const row of rows.slice(0, plannedSets)) {
    if (row.done && row.weightKg !== null) {
      judged.push({ weightKg: row.weightKg, reps: row.reps, done: true, isWarmup: false });
    }
  }
  return judged;
}
