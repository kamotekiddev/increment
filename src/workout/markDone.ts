import type { LoadType } from "../engine";
import type { SetRow } from "./types";

/** A weighted set cannot be marked done while its weight is blank. A bodyweight set needs reps only. */
export function canMarkDone(row: SetRow, loadType: LoadType): boolean {
  return loadType === "bodyweight" || row.weightKg !== null;
}

/** The fields a row takes when marked done or not done: a bodyweight set marked done carries weight 0. */
export function doneFields(done: boolean, loadType: LoadType): { done: boolean; weightKg?: number } {
  return done && loadType === "bodyweight" ? { done, weightKg: 0 } : { done };
}

/**
 * Marks one row done or not done. Marking done is ignored while a weighted set's weight is blank;
 * unmarking always works. A bodyweight set marked done carries weight 0.
 */
export function setDone(rows: SetRow[], index: number, done: boolean, loadType: LoadType): SetRow[] {
  const row = rows[index];
  if (!row || row.done === done) return rows;
  if (done && !canMarkDone(row, loadType)) return rows;
  return rows.map((r, i) => (i === index ? { ...r, ...doneFields(done, loadType) } : r));
}
