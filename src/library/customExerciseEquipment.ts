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

export const BODYWEIGHT_LOCKED_NOTE = "Bodyweight can't be switched once the exercise is used.";

/**
 * Pure: the Equipment chips that can't be picked on Edit. Once the exercise is used (in a routine or has a
 * logged set) Bodyweight can't be switched to or from, because its sets and records are reps only; every other
 * switch stays open. Before use nothing is locked.
 */
export function lockedEquipment(current: string | null, used: boolean): EquipmentValue[] {
  if (!used || current === null) return [];
  const isBodyweight = current === "bodyweight";
  return EQUIPMENT_CHOICES.map((c) => c.value).filter((value) => (value === "bodyweight") !== isBodyweight);
}

/** Pure: Bodyweight equipment tracks reps only, everything else is weight x reps. */
export function loadTypeForEquipment(equipment: string): LoadType {
  return equipment === "bodyweight" ? "bodyweight" : "weighted";
}
