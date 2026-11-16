import type { SetRow } from "./types";

/** Adds a set beyond the plan: a copy of the row above, not done and untouched. There is no remove. */
export function addSetRow(rows: SetRow[]): SetRow[] {
  const above = rows[rows.length - 1];
  return [...rows, { weightKg: above ? above.weightKg : null, reps: above ? above.reps : 0, done: false, edited: false }];
}
