/** Pure: a new list with the item at `index` moved one place. Out of range or at an end, the order is unchanged. */
export function moveExercise<T>(list: readonly T[], index: number, direction: "up" | "down"): T[] {
  const target = direction === "up" ? index - 1 : index + 1;
  const next = [...list];
  if (index < 0 || index >= list.length || target < 0 || target >= list.length) return next;
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}
