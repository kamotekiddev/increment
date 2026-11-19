import type { LoadType } from "../engine";
import type { SetRow } from "./types";

/** A weighted set cannot be marked done while its weight is blank. A bodyweight set needs reps only. */
export function canMarkDone(row: SetRow, loadType: LoadType = "weighted"): boolean {
  return loadType === "bodyweight" || row.weightKg !== null;
}

/**
 * Marks one row done or not done. Marking done is ignored while a weighted set's weight is blank;
 * unmarking always works. A bodyweight set marked done carries weight 0.
 */
export function setDone(rows: SetRow[], index: number, done: boolean, loadType: LoadType = "weighted"): SetRow[] {
  const row = rows[index];
  if (!row || row.done === done) return rows;
  if (done && !canMarkDone(row, loadType)) return rows;
  const weight = done && loadType === "bodyweight" ? { weightKg: 0 } : {};
  return rows.map((r, i) => (i === index ? { ...r, ...weight, done } : r));
}
