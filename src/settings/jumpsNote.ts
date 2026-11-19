import { formatWeight, type Unit } from "@/units";

import { effectiveJumps, JUMP_KEYS, UNTOUCHED_JUMPS } from "./jumps";

const OTHER_UNIT: Record<Unit, Unit> = { kg: "lb", lb: "kg" };

/**
 * The note under the Weight jumps card: what the Jumps the lifter hasn't changed are in the other unit,
 * e.g. "In lb, jumps you haven’t changed are 5, 5, 10, 5 and 5 lb."
 */
export function untouchedJumpsNote(unit: Unit): string {
  const other = OTHER_UNIT[unit];
  const jumps = effectiveJumps(UNTOUCHED_JUMPS, other);
  const values = JUMP_KEYS.map((key) => formatWeight(jumps[key], other));
  const last = values[values.length - 1];
  return `In ${other}, jumps you haven’t changed are ${values.slice(0, -1).join(", ")} and ${last} ${other}.`;
}
