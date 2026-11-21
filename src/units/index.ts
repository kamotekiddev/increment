/**
 * Every kg/lb conversion lives here; no other file converts. Pure: no I/O, no React, no database.
 *
 * A set stores the number the lifter typed and its unit (`Weight`, ADR 0003). Targets and Jumps are kg.
 * Conversion happens in memory only, for display, rounding a weight about to be lifted, and for
 * comparing and adding up weights; a converted value is never saved.
 */

export type Unit = "kg" | "lb";

/** A number as typed and the unit it was typed in: how a set is stored. */
export interface Weight {
  value: number;
  unit: Unit;
}

/** Exact definition of the avoirdupois pound. */
export const KG_PER_LB = 0.45359237;

/** Rounds away float noise from a conversion: 135 lb to kg and back is 135, not 135.00000000000003. */
function clean(n: number, decimals = 6): number {
  const rounded = Number(n.toFixed(decimals));
  // Avoid "-0".
  return rounded === 0 ? 0 : rounded;
}

export function convert(value: number, from: Unit, to: Unit): number {
  if (from === to) return value;
  return from === "kg" ? value / KG_PER_LB : value * KG_PER_LB;
}

export function toKg(value: number, unit: Unit): number {
  return convert(value, unit, "kg");
}

export function fromKg(kg: number, unit: Unit): number {
  return convert(kg, "kg", unit);
}

/** A stored set weight as kg, for math and comparisons in memory only. */
export function weightKg(w: Weight): number {
  return toKg(w.value, w.unit);
}

/** A kg value (a Target) as a number in `unit`, with conversion noise removed: what a pre-filled row stores. */
export function kgIn(kg: number, unit: Unit): number {
  return clean(fromKg(kg, unit));
}

/** The nearest loadable weight, an exact tie rounding up: 132.28 lb with a 5 lb step is 130. */
export function roundToLoadable(value: number, step: number): number {
  return clean(Math.round(clean(value / step, 9)) * step);
}

/**
 * A weight about to be lifted, in `unit`. One saved in `unit` comes back exactly; one saved in the other unit is
 * converted and rounded to the Jump (`jumpKg`, the Jump's kg value) so it can be loaded: 100 kg with a 5 lb
 * Jump is 220 lb, 135 lb with a 2.5 kg Jump is 60 kg.
 */
export function loadableIn(w: Weight, unit: Unit, jumpKg: number): number {
  if (w.unit === unit) return w.value;
  return roundToLoadable(convert(w.value, w.unit, unit), clean(fromKg(jumpKg, unit)));
}

/** A number for display: up to `decimals` places, trailing zeros dropped (60, 62.5, 61.25). */
export function formatNumber(n: number, decimals = 2): string {
  const scale = 10 ** decimals;
  const rounded = Math.round((n + Number.EPSILON) * scale) / scale;
  // Avoid "-0".
  return String(rounded === 0 ? 0 : rounded);
}

/** A kg value converted and rounded to 0.01 (or `decimals`). Never written back. */
export function displayWeight(kg: number, unit: Unit, decimals = 2): number {
  return Number(formatNumber(fromKg(kg, unit), decimals));
}

/** A kg value as display text in `unit`, trailing zeros dropped: 135, 62.5, 61.23. */
export function formatWeight(kg: number, unit: Unit, decimals = 2): string {
  return formatNumber(fromKg(kg, unit), decimals);
}

/** A kg value as display text with the unit label: "62.5 kg", "135 lb". */
export function formatWithUnit(kg: number, unit: Unit): string {
  return `${formatWeight(kg, unit)} ${unit}`;
}

/** A stored set weight as plain text in `unit`: exact when saved in `unit`, else converted to 0.01. */
export function weightIn(w: Weight, unit: Unit): string {
  return formatNumber(convert(w.value, w.unit, unit));
}

/**
 * A logged set as history shows it: exactly as saved when its unit matches ("45"), else converted to one
 * decimal and marked approximate ("≈20.4"). Never rounded to a plate weight.
 */
export function loggedWeightText(w: Weight, unit: Unit): string {
  return w.unit === unit ? formatNumber(w.value) : `≈${formatNumber(convert(w.value, w.unit, unit), 1)}`;
}

/** `loggedWeightText` with the unit label: "45 lb", "≈20.4 kg". */
export function loggedWeightWithUnit(w: Weight, unit: Unit): string {
  return `${loggedWeightText(w, unit)} ${unit}`;
}
