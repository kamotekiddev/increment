import { loadableIn, type Unit } from "../units";
import type { SetRow } from "./types";

/**
 * A row as the live workout shows it in `unit`. A row the lifter has neither typed nor checked follows the
 * unit: one saved in the other unit is converted and rounded down to the Jump (`jumpKg`), so 62.5 kg shows as 135 lb
 * with a 5 lb Jump. Display only: switching unit never writes a set. The row is saved this way when the lifter
 * checks or edits it. Checked and typed rows keep their saved number and unit.
 */
export function followUnit<R extends SetRow>(row: R, unit: Unit, jumpKg: number): R {
  if (row.done || row.edited || row.unit === unit) return row;
  if (row.weight === null) return { ...row, unit };
  return { ...row, weight: loadableIn({ value: row.weight, unit: row.unit }, unit, jumpKg), unit };
}

/** `followUnit` for every row of one exercise. */
export function followUnitRows<R extends SetRow>(rows: R[], unit: Unit, jumpKg: number): R[] {
  return rows.map((r) => followUnit(r, unit, jumpKg));
}
