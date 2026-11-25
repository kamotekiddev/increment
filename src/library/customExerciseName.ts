export const EXERCISE_NAME_MAX = 40;

export interface ExerciseNameRef {
  id: number;
  name: string;
}

export type ExerciseNameResult =
  | { ok: true; name: string }
  | { ok: false; reason: "empty" | "too-long" | "duplicate" };

/**
 * Pure: checks an exercise name. Trims it, allows 1 to 40 characters, and rejects a case-insensitive
 * match with any library or custom exercise (never the one with `ownId`, so an edit can keep its name).
 */
export function validateExerciseName(
  name: string,
  existing: readonly ExerciseNameRef[],
  ownId?: number,
): ExerciseNameResult {
  const trimmed = name.trim();
  if (trimmed.length === 0) return { ok: false, reason: "empty" };
  if (trimmed.length > EXERCISE_NAME_MAX) return { ok: false, reason: "too-long" };
  const key = trimmed.toLowerCase();
  const taken = existing.some((e) => e.id !== ownId && e.name.trim().toLowerCase() === key);
  if (taken) return { ok: false, reason: "duplicate" };
  return { ok: true, name: trimmed };
}

/** Pure: the inline message under the Name field, or null when there is nothing to say (an empty name just turns Save off). */
export function exerciseNameMessage(result: ExerciseNameResult, typed: string): string | null {
  if (result.ok) return null;
  switch (result.reason) {
    case "empty":
      return null;
    case "too-long":
      return `Keep the name to ${EXERCISE_NAME_MAX} characters or fewer.`;
    case "duplicate":
      return `You already have an exercise called ${typed.trim()}.`;
  }
}
