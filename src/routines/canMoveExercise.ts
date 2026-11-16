/** Pure: whether the row at `index` of a list of `length` can move one place in `direction`. */
export function canMoveExercise(length: number, index: number, direction: "up" | "down"): boolean {
  return direction === "up" ? index > 0 : index < length - 1;
}
