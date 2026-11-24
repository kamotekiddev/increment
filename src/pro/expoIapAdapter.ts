import {
  fetchProducts,
  finishTransaction,
  getAvailablePurchases,
  initConnection,
  purchaseUpdatedListener,
  requestPurchase,
  type Purchase,
} from "expo-iap";

import { createStoreAdapter } from "./guardedStoreAdapter";

/**
 * The real store adapter: expo-iap 6.5.1 behind the guarded Pro calls. This is the only file that
 * imports expo-iap (an ESLint rule keeps it that way), and Jest maps expo-iap to a stub, so tests never
 * load the native module.
 *
 * "What is owned" is `getAvailablePurchases` with active items only: StoreKit 2's current entitlements
 * on iOS (no App Store sign-in prompt; `restorePurchases` would call `AppStore.sync`, which prompts) and
 * Play Billing's purchase query on Android.
 */
export const expoIapAdapter = createStoreAdapter<Purchase>({
  initConnection: () => initConnection(),
  fetchProducts: (request) => fetchProducts(request),
  requestPurchase: (props) => requestPurchase(props),
  getAvailablePurchases: (options) => getAvailablePurchases(options),
  finishTransaction: (args) => finishTransaction(args),
  purchaseUpdatedListener: (listener) => purchaseUpdatedListener(listener),
});
