import type { StoreAnswer } from "./entitlementDecision";
import { PRO_PRODUCT_ID } from "./product";

/**
 * A purchase as expo-iap reports it (`Purchase`), trimmed to the fields read here. Declared here so
 * this file never imports expo-iap; expo-iap's own type fits it.
 */
export interface StorePurchase {
  id: string;
  productId: string;
  purchaseState: "pending" | "purchased" | "unknown";
  /** The iOS signed transaction (JWS) or the Android purchase token. */
  purchaseToken?: string | null;
  /** Android only: whether Google has been told the purchase was delivered. */
  isAcknowledgedAndroid?: boolean | null;
  /** iOS only: set when Apple refunded or revoked the transaction. */
  revocationDateIOS?: number | null;
}

/** The Pro purchases in the list, leaving out any Apple has revoked. */
function proPurchases<P extends StorePurchase>(purchases: readonly P[]): P[] {
  return purchases.filter((p) => p.productId === PRO_PRODUCT_ID && p.revocationDateIOS == null);
}

/**
 * Maps the store's purchase list to its answer about Pro (ADR 0004). Purchased beats pending. A Pro
 * purchase in an unknown state is "no answer", never "not owned", so a real buyer never loses Pro.
 */
export function answerFromPurchases(purchases: readonly StorePurchase[]): StoreAnswer {
  const pro = proPurchases(purchases);
  const owned = pro.find((p) => p.purchaseState === "purchased") ?? pro.find((p) => p.purchaseState === "pending");
  if (owned) {
    return {
      kind: "owned",
      productId: owned.productId,
      proof: owned.purchaseToken || owned.id,
      state: owned.purchaseState === "purchased" ? "purchased" : "pending",
    };
  }
  return pro.length > 0 ? { kind: "no-answer" } : { kind: "not-owned" };
}

/**
 * What a failed purchase request means, from expo-iap's error code (`ErrorCode`, kebab-case strings).
 * StoreKit's pending result (Ask to Buy) arrives as the error `deferred-payment`, so it maps to pending.
 */
export function buyOutcomeFromError(error: unknown): "cancelled" | "pending" | "already-owned" | "error" {
  const code = typeof error === "object" && error !== null && "code" in error ? error.code : undefined;
  switch (code) {
    case "user-cancelled":
      return "cancelled";
    case "deferred-payment":
    case "pending":
      return "pending";
    case "already-owned":
      return "already-owned";
    default:
      return "error";
  }
}

/**
 * The purchased Pro purchases to finish with `isConsumable: false`. On Android that is the acknowledge,
 * without which Google refunds the purchase after 3 days; an acknowledged one is skipped. iOS has no
 * acknowledged flag, and finishing an already finished transaction does nothing there. A pending
 * purchase is never finished, since its payment hasn't cleared.
 */
export function purchasesToFinish<P extends StorePurchase>(purchases: readonly P[]): P[] {
  return proPurchases(purchases).filter((p) => p.purchaseState === "purchased" && p.isAcknowledgedAndroid !== true);
}
