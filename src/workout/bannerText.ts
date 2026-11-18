import type { Target } from "../engine";
import { formatWithUnit, type Unit } from "../units";

/** The line in the Target banner. With no Target it is the first-time note. */
export function bannerText(target: Target | null, range: { repMin: number; repMax: number } | null, unit: Unit): string {
  if (target) return `Target: ${formatWithUnit(target.weightKg, unit)} × ${target.reps}`;
  const forRange = range ? ` for ${range.repMin} to ${range.repMax} reps` : "";
  return `First time on this exercise. Pick a weight you can do${forRange}.`;
}
