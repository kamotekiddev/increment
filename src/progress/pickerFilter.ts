import type { PickerExercise } from "./progressQueries";

/** The picker shows its search field only when the list has more than this many exercises. */
const SEARCH_ABOVE = 8;

export function showsSearch(list: PickerExercise[]): boolean {
  return list.length > SEARCH_ABOVE;
}

/** The exercises whose name contains the query (any case), in the list's order. A blank query keeps all. */
export function filterPicker(list: PickerExercise[], query: string): PickerExercise[] {
  const q = query.trim().toLowerCase();
  return q === "" ? list : list.filter((e) => e.name.toLowerCase().includes(q));
}
