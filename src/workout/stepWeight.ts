import { JUMP_KG } from "./jump";

/** − or + on the weight: one Jump, never below 0. A blank weight starts at the Jump on +, stays blank on −. */
export function stepWeight(weightKg: number | null, direction: 1 | -1): number | null {
  if (weightKg === null) return direction === 1 ? JUMP_KG : null;
  return Math.max(0, Math.round((weightKg + direction * JUMP_KG) * 1000) / 1000);
}

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
