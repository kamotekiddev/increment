import type { Unit } from "@/units";

const OTHER_UNIT: Record<Unit, Unit> = { kg: "lb", lb: "kg" };

/**
 * The note under the Weight jumps card: a Jump set here shows in the other unit as the nearest rung of that
 * unit's ladder, e.g. "In lb, each jump shows as the nearest plate step." (5 kg shows as 10 lb).
 */
export function jumpsNote(unit: Unit): string {
  return `In ${OTHER_UNIT[unit]}, each jump shows as the nearest plate step.`;
}
