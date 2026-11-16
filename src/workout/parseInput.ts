/** Typed weight text: a number, null for empty (blank), undefined when invalid. */
export function parseWeight(text: string): number | null | undefined {
  const t = text.trim().replace(",", ".");
  if (t === "") return null;
  if (!/^\d*\.?\d*$/.test(t) || t === ".") return undefined;
  return Number(t);
}

/** Typed reps text: a whole number, 0 for empty, undefined when invalid. */
export function parseReps(text: string): number | undefined {
  const t = text.trim();
  if (t === "") return 0;
  return /^\d+$/.test(t) ? Number(t) : undefined;
}
