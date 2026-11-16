export const ROUTINE_NAME_MAX = 40;

export interface RoutineNameRef {
  id: number;
  name: string;
}

export type RoutineNameResult =
  | { ok: true; name: string }
  | { ok: false; reason: "empty" | "too-long" | "duplicate" };

/**
 * Pure: checks a Routine name. Trims it, allows 1 to 40 characters, and rejects a
 * case-insensitive match with another Routine (never the one with `ownId`).
 */
export function validateRoutineName(
  name: string,
  existing: readonly RoutineNameRef[],
  ownId?: number,
): RoutineNameResult {
  const trimmed = name.trim();
  if (trimmed.length === 0) return { ok: false, reason: "empty" };
  if (trimmed.length > ROUTINE_NAME_MAX) return { ok: false, reason: "too-long" };
  const key = trimmed.toLowerCase();
  const taken = existing.some((r) => r.id !== ownId && r.name.trim().toLowerCase() === key);
  if (taken) return { ok: false, reason: "duplicate" };
  return { ok: true, name: trimmed };
}
