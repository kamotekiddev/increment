import type { ExerciseFilter } from "./filterExercises";

export const NO_FILTERS: ExerciseFilter = { search: "", group: null };

/** One chip at a time: tapping another replaces it, tapping the active one clears it. */
export function toggleChip<T extends string>(current: T | null, tapped: T): T | null {
  return current === tapped ? null : tapped;
}

/** Whether a search or a group chip is set. */
export function isFiltering({ search, group }: ExerciseFilter): boolean {
  return search.trim().length > 0 || group !== null;
}

/** The count above the Library list, e.g. "6 results" or "1 result". */
export function resultCount(count: number): string {
  return `${count} ${count === 1 ? "result" : "results"}`;
}

/** The trailing pill on a Library row, e.g. "2 routines" or "1 routine". */
export function routineCountLabel(count: number): string {
  return `${count} ${count === 1 ? "routine" : "routines"}`;
}

/** The name the no-match Create row offers: the trimmed search text, or null when nothing is typed. */
export function createRowName({ search }: ExerciseFilter): string | null {
  const text = search.trim();
  return text.length > 0 ? text : null;
}

/** The Create row title, e.g. Create “landmine”. */
export function createRowLabel(name: string): string {
  return `Create “${name}”`;
}

/** The empty-state title, e.g. No match for “press” with Arms. */
export function emptyMessage({ search, group }: ExerciseFilter): string {
  const text = search.trim();
  const subject = [text ? `“${text}”` : "", text && group ? "with" : "", group ?? ""]
    .filter(Boolean)
    .join(" ");
  return `No match for ${subject}`;
}
