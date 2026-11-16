export type BrowseFilters = {
  search: string;
  muscle: string | null;
  equipment: string | null;
};

/** One chip per row: tapping another replaces it, tapping the active one clears it. */
export function toggleChip(
  current: string | null,
  tapped: string,
): string | null {
  return current === tapped ? null : tapped;
}

export function hasActiveFilters({
  search,
  muscle,
  equipment,
}: BrowseFilters): boolean {
  return search.trim() !== "" || muscle !== null || equipment !== null;
}

/** The empty-state sentence, naming what was searched. */
export function emptyMessage({
  search,
  muscle,
  equipment,
}: BrowseFilters): string {
  const parts: string[] = [];
  const text = search.trim();
  if (text) parts.push(`"${text}"`);
  if (muscle) parts.push(muscle);
  if (equipment) parts.push(equipment);
  return `No exercises match ${parts.join(", ")}.`;
}
