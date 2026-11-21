import type { Unit } from "../units";
import type { SetRow } from "./types";

export interface SetEdit {
  /** A weight as typed, saved as is with `unit`. */
  weight?: number | null;
  /** The unit `weight` was typed in: the unit on screen. Required with `weight`. */
  unit?: Unit;
  reps?: number;
}

/**
 * Applies an edit to one row and returns new rows. The row is marked edited.
 * Later rows that are untouched and not done take the same change; edited and done rows never change.
 */
export function applyEdit(rows: SetRow[], index: number, edit: SetEdit): SetRow[] {
  const change = (row: SetRow): SetRow => ({
    ...row,
    ...(edit.weight !== undefined ? { weight: edit.weight, unit: edit.unit ?? row.unit } : {}),
    ...(edit.reps !== undefined ? { reps: edit.reps } : {}),
  });
  return rows.map((row, i) => {
    if (i === index) return { ...change(row), edited: true };
    if (i > index && !row.edited && !row.done) return change(row);
    return row;
  });
}
