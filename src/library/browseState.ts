import type { ExerciseFilter } from "./filterExercises";

export const NO_FILTERS: ExerciseFilter = { search: "", group: null };

/** One chip at a time: tapping another replaces it, tapping the active one clears it. */
export function toggleChip<T extends string>(current: T | null, tapped: T): T | null {
  return current === tapped ? null : tapped;
}

/** The empty-state sentence, e.g. No exercises match "press" with Arms. */
export function emptyMessage({ search, group }: ExerciseFilter): string {
  const text = search.trim();
  const subject = [text ? `"${text}"` : "", text && group ? "with" : "", group ?? ""]
    .filter(Boolean)
    .join(" ");
  return `No exercises match ${subject}.`;
}
