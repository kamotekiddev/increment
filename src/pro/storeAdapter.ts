import type { StoreAnswer } from "./entitlementDecision";

/**
 * The thin I/O seam over the phone's store. Ticket 04 implements it with expo-iap and adds connect,
 * fetch the Pro product and buy. Tests use a fake; nothing here imports a native module.
 */
export interface ProStoreAdapter {
  /** Asks the store what this lifter owns. Should map every error and timeout to "no answer". */
  checkOwned: () => Promise<StoreAnswer>;
}

/** Stands in until the real adapter lands: the store never answers, so the cached row decides Pro. */
export const noAnswerAdapter: ProStoreAdapter = {
  checkOwned: () => Promise.resolve({ kind: "no-answer" }),
};
