import type { ExerciseFilter } from "./filterExercises";

export const NO_FILTERS: ExerciseFilter = { search: "", muscle: null, equipment: null };

/** One chip per row: tapping another replaces it, tapping the active one clears it. */
export function toggleChip(current: string | null, tapped: string): string | null {
  return current === tapped ? null : tapped;
}

/** The empty-state sentence, e.g. No exercises match "press" with Triceps and Dumbbell. */
export function emptyMessage({ search, muscle, equipment }: ExerciseFilter): string {
  const text = search.trim();
  const chips = [muscle, equipment].filter(Boolean).join(" and ");
  const subject = [text ? `"${text}"` : "", text && chips ? "with" : "", chips]
    .filter(Boolean)
    .join(" ");
  return `No exercises match ${subject}.`;
}
