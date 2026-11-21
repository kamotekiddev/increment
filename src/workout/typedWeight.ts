import { weightIn, type Unit } from "@/units";

/**
 * What a row's weight field shows in the unit on screen: the saved number when it was saved in that unit
 * (exact, up to 0.01), else converted. Display only: a weight the lifter has not typed is never read back
 * from this text, so switching unit changes nothing in storage.
 */
export function weightText(row: { weight: number | null; unit: Unit }, unit: Unit): string {
  return row.weight === null ? "" : weightIn({ value: row.weight, unit: row.unit }, unit);
}
