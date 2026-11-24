/**
 * Jest's stand-in for expo-iap (mapped in package.json), so no test ever loads the native module. Every
 * store call fails, which the guarded adapter turns into "no answer". Store tests use
 * `FakeProStoreAdapter` instead.
 */
const unavailable = () => Promise.reject(new Error("expo-iap isn't available in Jest"));

export const initConnection = unavailable;
export const fetchProducts = unavailable;
export const requestPurchase = unavailable;
export const getAvailablePurchases = unavailable;
export const finishTransaction = unavailable;
export const purchaseUpdatedListener = () => ({ remove: () => {} });
