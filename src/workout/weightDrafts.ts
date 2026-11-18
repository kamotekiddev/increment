import type { Unit } from "@/units";

import { weightText } from "./typedWeight";

/**
 * The weight text a lifter typed into each row after an edit, by set id, and the unit it was typed in.
 * A draft lasts until its set is checked, the unit changes, or the screen is left. Until then the
 * field shows exactly what was typed ("135.005" stays "135.005"); an unedited weight has no draft
 * and is shown from its exact stored kg. After a unit switch every draft is dropped and the field
 * shows the stored kg converted, so nothing reads in the old unit.
 */
export interface WeightDrafts {
  unit: Unit | null;
  texts: Readonly<Record<number, string>>;
}

export const EMPTY_DRAFTS: WeightDrafts = { unit: null, texts: {} };

/** Drafts that still apply on screen in this unit. */
function live(drafts: WeightDrafts, unit: Unit): WeightDrafts["texts"] {
  return drafts.unit === unit ? drafts.texts : {};
}

/** Records text typed into a row in the unit on screen. */
export function typeDraft(drafts: WeightDrafts, setId: number, text: string, unit: Unit): WeightDrafts {
  return { unit, texts: { ...live(drafts, unit), [setId]: text } };
}

/** Drops one row's draft (its set was checked). */
export function clearDraft(drafts: WeightDrafts, setId: number): WeightDrafts {
  if (!(setId in drafts.texts)) return drafts;
  const texts = { ...drafts.texts };
  delete texts[setId];
  return { unit: drafts.unit, texts };
}

/** What a row's weight field shows: its draft when it has one in this unit, else its stored kg converted. */
export function weightFieldText(drafts: WeightDrafts, row: { setId: number; weightKg: number | null }, unit: Unit): string {
  return live(drafts, unit)[row.setId] ?? weightText(row.weightKg, unit);
}
