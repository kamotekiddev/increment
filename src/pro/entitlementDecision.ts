/** The cached Pro purchase, as stored in the single `entitlements` row. */
export interface EntitlementRow {
  isPro: boolean;
  productId: string | null;
  /** The iOS signed transaction or the Android purchase token. Kept as a record; nothing verifies it (ADR 0004). */
  proof: string | null;
  /** When the store last gave a definite answer, in ms since the epoch. */
  verifiedAt: number | null;
}

/** What the phone's store says this lifter owns. */
export type StoreAnswer =
  | { kind: "owned"; productId: string; proof: string; state: "purchased" | "pending" }
  | { kind: "not-owned" }
  | { kind: "no-answer" };

export interface EntitlementDecision {
  /** The row after the store's answer. */
  row: EntitlementRow;
  /** Whether the row must be written. False when the answer leaves it untouched. */
  write: boolean;
  /** The store holds a Pro purchase whose payment hasn't cleared yet. */
  pending: boolean;
  /** The row went from free (or no row) to Pro. */
  switchedOn: boolean;
}

const FREE: EntitlementRow = { isPro: false, productId: null, proof: null, verifiedAt: null };

/**
 * The store decides Pro (ADR 0004). Pure: given the cached row (null when none exists yet), the store's
 * answer and `now`, returns the row to keep and whether Pro just switched on.
 */
export function decideEntitlement(cached: EntitlementRow | null, answer: StoreAnswer, now: number): EntitlementDecision {
  const current = cached ?? FREE;
  switch (answer.kind) {
    case "no-answer":
      return { row: current, write: false, pending: false, switchedOn: false };
    case "not-owned":
      return { row: { ...FREE, verifiedAt: now }, write: true, pending: false, switchedOn: false };
    case "owned":
      if (answer.state === "pending") return { row: current, write: false, pending: true, switchedOn: false };
      return {
        row: { isPro: true, productId: answer.productId, proof: answer.proof, verifiedAt: now },
        write: true,
        pending: false,
        switchedOn: !current.isPro,
      };
  }
}
