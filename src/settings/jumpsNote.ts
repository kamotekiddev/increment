import type { Unit } from "@/units";

const OTHER_UNIT: Record<Unit, Unit> = { kg: "lb", lb: "kg" };

/**
 * The note under the Weight jumps card: kg and lb keep separate Jumps, so a change in one unit leaves the
 * other alone, e.g. "Each unit keeps its own jumps. A change here doesn’t touch your lb jumps."
 */
export function jumpsNote(unit: Unit): string {
  return `Each unit keeps its own jumps. A change here doesn’t touch your ${OTHER_UNIT[unit]} jumps.`;
}
