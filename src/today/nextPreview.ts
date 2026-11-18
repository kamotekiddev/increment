import type { LoadType, Target } from "../engine";
import { formatWithUnit, type Unit } from "../units";

/** How many exercises the rest-day Next card lists. */
export const PREVIEW_LIMIT = 3;

/** One exercise of the Next Routine, with the Target the engine would give at Start. */
export interface PreviewExercise {
  name: string;
  equipment: string;
  loadType: LoadType;
  target: Target | null;
}

export interface PreviewRow {
  name: string;
  equipment: string;
  /** "65 kg", or "10 reps" for bodyweight; empty when there is no Target yet. */
  targetText: string;
}

export interface NextPreview {
  rows: PreviewRow[];
  /** Exercises beyond the listed ones. */
  more: number;
}

/** The Target as the card writes it: weight and unit only, or the reps for a bodyweight exercise. */
export function previewTargetText(loadType: LoadType, target: Target | null, unit: Unit): string {
  if (!target) return "";
  if (target.weightKg === 0 || loadType === "bodyweight") return `${target.reps} ${target.reps === 1 ? "rep" : "reps"}`;
  return formatWithUnit(target.weightKg, unit);
}

/** Pure: the first exercises of the Next Routine as card rows, and how many more there are. */
export function toNextPreview(items: PreviewExercise[], unit: Unit, total: number = items.length): NextPreview {
  const shown = items.slice(0, PREVIEW_LIMIT);
  return {
    rows: shown.map((e) => ({ name: e.name, equipment: e.equipment, targetText: previewTargetText(e.loadType, e.target, unit) })),
    more: Math.max(0, total - shown.length),
  };
}
