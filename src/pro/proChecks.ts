import type { AppStateStatus } from "react-native";

import type { ProState } from "./proStore";
import type { ProStoreAdapter } from "./storeAdapter";

/** The part of React Native's `AppState` the checks listen to. */
export interface AppStateSource {
  addEventListener: (type: "change", handler: (state: AppStateStatus) => void) => { remove: () => void };
}

/**
 * Starts the store checks ADR 0004 sets: asks the store what is owned now, again each time the app
 * returns to the foreground, and each time the store reports a purchase on its own (a pending payment
 * clearing). Call it once, at the root, once the database is ready. Nothing waits on it: screens draw from
 * the loaded row. Returns a function that stops the checks.
 */
export function startProChecks(
  store: Pick<ProState, "refresh">,
  adapter: Pick<ProStoreAdapter, "onPurchaseUpdate">,
  appState: AppStateSource,
): () => void {
  void store.refresh();
  const foreground = appState.addEventListener("change", (state) => {
    if (state === "active") void store.refresh();
  });
  // The pushed answer isn't written as is: refresh asks again and writes through the entitlement decision.
  const stopUpdates = adapter.onPurchaseUpdate(() => void store.refresh());
  return () => {
    foreground.remove();
    stopUpdates();
  };
}
