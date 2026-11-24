import type { Unit } from "@/units";

import { Segmented, type SegmentedOption } from "./Segmented";

const UNITS: readonly SegmentedOption<Unit>[] = [
  { value: "kg", label: "Kilograms", short: "kg" },
  { value: "lb", label: "Pounds", short: "lb" },
];

/**
 * The kg / lb radio group, shared by the live workout pill and the Settings card.
 * `compact` is the small "kg | lb" pill; `wide` is the full-width Kilograms / Pounds control.
 * `track` is the colour behind the two options.
 */
export function UnitSegmented({
  unit,
  onChange,
  size,
  track,
}: {
  unit: Unit;
  onChange: (unit: Unit) => void;
  size: "compact" | "wide";
  track: "card" | "sunk";
}) {
  return <Segmented options={UNITS} value={unit} onChange={onChange} size={size} track={track} accessibilityLabel="Weight unit" />;
}
