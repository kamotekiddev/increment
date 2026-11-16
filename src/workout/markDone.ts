import type { SetRow } from "./types";

/** A set cannot be marked done while its weight is blank. */
export function canMarkDone(row: SetRow): boolean {
  return row.weightKg !== null;
}

/** Marks one row done or not done. Marking done is ignored while the weight is blank; unmarking always works. */
export function setDone(rows: SetRow[], index: number, done: boolean): SetRow[] {
  const row = rows[index];
  if (!row || row.done === done) return rows;
  if (done && !canMarkDone(row)) return rows;
  return rows.map((r, i) => (i === index ? { ...r, done } : r));
}
