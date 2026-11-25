/** Route params for New exercise: the Name pre-fill, and the routine when opened from its picker. */
export function newExerciseParams(search: string, routineId?: number): { name: string; routineId?: string } {
  const name = search.trim();
  return routineId === undefined ? { name } : { name, routineId: String(routineId) };
}

export type AfterSave =
  | { kind: "back" }
  | { kind: "picker"; params: { routineId: string; created: string } };

/**
 * Where Save goes. From the Library (no routine id) it pops back, and the list reloads on focus with the
 * new exercise in it. From a routine's picker it returns there with the new exercise to pick.
 */
export function afterSaveTarget(routineId: string | undefined, createdId: number): AfterSave {
  if (!routineId || !Number.isInteger(Number(routineId))) return { kind: "back" };
  return { kind: "picker", params: { routineId, created: String(createdId) } };
}

/** The just-created exercise to pick, once the picker's list has loaded it; null while waiting or without one. */
export function createdPick<T extends { id: number }>(exercises: readonly T[], created: string | undefined): T | null {
  if (!created) return null;
  const id = Number(created);
  if (!Number.isInteger(id)) return null;
  return exercises.find((exercise) => exercise.id === id) ?? null;
}
