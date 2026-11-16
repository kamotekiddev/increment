import type { SetRow } from "./types";

/** The row that shows the − and + weight stepper: the one touched last, else the first not done, else the last row. */
export function editRowIndex(rows: SetRow[], touched: number | null): number | null {
  if (rows.length === 0) return null;
  if (touched !== null && touched >= 0 && touched < rows.length) return touched;
  const open = rows.findIndex((r) => !r.done);
  return open === -1 ? rows.length - 1 : open;
}
