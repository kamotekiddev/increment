import type { LoadType, Target } from "../engine";
import type { Unit } from "../units";
import { targetText } from "./cardLine";

/**
 * The line in the Target banner. With no Target it is the first-time note. A bodyweight exercise
 * has no weight, so its Target reads as reps only.
 */
export function bannerText(
  target: Target | null,
  range: { repMin: number; repMax: number } | null,
  unit: Unit,
  loadType: LoadType,
): string {
  const bodyweight = loadType === "bodyweight";
  if (target) return `Target: ${targetText(bodyweight ? { ...target, weightKg: 0 } : target, unit)}`;
  if (bodyweight) {
    return range ? `First time on this exercise. Aim for ${range.repMin} to ${range.repMax} reps.` : "First time on this exercise. Log the reps you do.";
  }
  const forRange = range ? ` for ${range.repMin} to ${range.repMax} reps` : "";
  return `First time on this exercise. Pick a weight you can do${forRange}.`;
}
