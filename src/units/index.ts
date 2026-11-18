/** Weights are stored in kg only. These helpers convert for display and for entry. */

export type Unit = "kg" | "lb";

/** Exact definition of the avoirdupois pound. */
export const KG_PER_LB = 0.45359237;

export function toKg(value: number, unit: Unit): number {
  return unit === "kg" ? value : value * KG_PER_LB;
}

export function fromKg(kg: number, unit: Unit): number {
  return unit === "kg" ? kg : kg / KG_PER_LB;
}

/** The number shown to the lifter: converted, rounded to 0.01. Never written back. */
export function displayWeight(kg: number, unit: Unit): number {
  const rounded = Math.round((fromKg(kg, unit) + Number.EPSILON) * 100) / 100;
  // Avoid "-0".
  return rounded === 0 ? 0 : rounded;
}

/** Display text with trailing zeros dropped: 135, 62.5, 61.23. */
export function formatWeight(kg: number, unit: Unit): string {
  return String(displayWeight(kg, unit));
}

/** Display text with the unit label: "62.5 kg", "135 lb". */
export function formatWithUnit(kg: number, unit: Unit): string {
  return `${formatWeight(kg, unit)} ${unit}`;
}
