import { formatWeight, toKg, type Unit } from "@/units";

import { parseWeight } from "./parseInput";

/**
 * Typed weight text read in the unit on screen, as kg: null for blank, undefined when invalid.
 * Only typed text goes through this. A weight the lifter has not typed keeps its exact stored kg
 * and is never read back from display text, so switching unit changes nothing in storage.
 */
export function weightFromTyped(text: string, unit: Unit): number | null | undefined {
  const parsed = parseWeight(text);
  return typeof parsed === "number" ? toKg(parsed, unit) : parsed;
}

/** What the weight field shows for a stored kg value in the unit on screen. Display only. */
export function weightText(weightKg: number | null, unit: Unit): string {
  return weightKg === null ? "" : formatWeight(weightKg, unit);
}
