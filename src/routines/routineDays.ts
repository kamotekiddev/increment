/** Day labels in week order; the index is the bit in the days bitmask (Monday = bit 0). */
export const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

/** Pure: whether the day at `index` (0 = Monday) is set in the bitmask. */
export function isDaySet(mask: number, index: number): boolean {
  return (mask & (1 << index)) !== 0;
}

/** Pure: the bitmask with the day at `index` switched on or off. */
export function toggleDay(mask: number, index: number): number {
  return mask ^ (1 << index);
}

/** Pure: the set days in week order, e.g. "Mon · Thu", or "No days". */
export function daysLabel(mask: number): string {
  const set = DAY_LABELS.filter((_, i) => isDaySet(mask, i));
  return set.length === 0 ? "No days" : set.join(" · ");
}
