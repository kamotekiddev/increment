import type { ProSource } from "@/pro/devSource";

/** The Developer card's "Pro source" choices, in order. */
export const PRO_SOURCE_OPTIONS: readonly { value: ProSource; label: string }[] = [
  { value: "store", label: "Store" },
  { value: "pro", label: "Pro" },
  { value: "free", label: "Free" },
];

/** What the Increment Pro card of Settings shows. */
export interface ProCardState {
  /** The word at the end of the row. */
  label: "Unlock" | "Unlocked";
  /** Free: the card opens the Paywall. Pro: it can't be tapped, since a Pro lifter never sees the Paywall. */
  tappable: boolean;
  /** The glyph after the label: a chevron (›) or a check (✓). */
  trailing: "chevron" | "check";
}

/** The Increment Pro card: "Unlock ›" for a free lifter, "Unlocked ✓" for a Pro lifter. */
export function proCardState(isPro: boolean): ProCardState {
  return isPro ? { label: "Unlocked", tappable: false, trailing: "check" } : { label: "Unlock", tappable: true, trailing: "chevron" };
}
