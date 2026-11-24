import type { StoreAnswer } from "./entitlementDecision";

/** The Pro product as the store sells it here, or that the store couldn't be reached or doesn't list it. */
export type ProProduct = { kind: "loaded"; localizedPrice: string } | { kind: "failed" };

/** How a purchase ended. Pending is a payment that clears later (cash, bank transfer, Ask to Buy). */
export type BuyResult = { kind: "purchased" } | { kind: "pending" } | { kind: "cancelled" } | { kind: "error" };

/**
 * The thin I/O seam over the phone's store. The real one wraps expo-iap (`expoIapAdapter.ts`, the only
 * file that imports it); tests use a fake. Every call is guarded: none rejects.
 */
export interface ProStoreAdapter {
  /** Opens the store connection. Resolves false when the store isn't there. The other calls connect on their own. */
  connect: () => Promise<boolean>;
  /** Fetches `pro_lifetime` with the store's localized price string. */
  fetchProduct: () => Promise<ProProduct>;
  /** Opens the store's payment sheet for Pro and resolves when it closes. */
  buy: () => Promise<BuyResult>;
  /** Asks the store what this lifter owns. Every error and timeout is "no answer". */
  checkOwned: () => Promise<StoreAnswer>;
  /**
   * Calls `listener` with the store's answer each time it reports a Pro purchase on its own (a pending
   * payment clearing, a purchase finishing while the app was away). Returns an unsubscribe function.
   */
  onPurchaseUpdate: (listener: (answer: StoreAnswer) => void) => () => void;
}

/** A store that never answers, so the cached row decides Pro. */
export const noAnswerAdapter: ProStoreAdapter = {
  connect: () => Promise.resolve(false),
  fetchProduct: () => Promise.resolve({ kind: "failed" }),
  buy: () => Promise.resolve({ kind: "error" }),
  checkOwned: () => Promise.resolve({ kind: "no-answer" }),
  onPurchaseUpdate: () => () => {},
};
