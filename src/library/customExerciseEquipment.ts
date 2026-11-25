import type { LoadType } from "@/engine";

/** The six Equipment chips of a custom exercise, in the design's order. `value` is what is stored. */
export const EQUIPMENT_CHOICES = [
  { label: "Barbell", value: "barbell" },
  { label: "Dumbbell", value: "dumbbell" },
  { label: "Machine", value: "machine" },
  { label: "Cable", value: "cable" },
  { label: "Bodyweight", value: "bodyweight" },
  { label: "Other", value: "other" },
] as const;

export type EquipmentValue = (typeof EQUIPMENT_CHOICES)[number]["value"];

/** Pure: Bodyweight equipment tracks reps only, everything else is weight x reps. */
export function loadTypeForEquipment(equipment: string): LoadType {
  return equipment === "bodyweight" ? "bodyweight" : "weighted";
}
