import type { StoreAnswer } from "./entitlementDecision";
import { PRO_PRODUCT_ID } from "./product";
import type { BuyResult, ProProduct, ProStoreAdapter } from "./storeAdapter";
import { answerFromPurchases, buyOutcomeFromError, purchasesToFinish, type StorePurchase } from "./storeMapping";

/** A product as expo-iap reports it, trimmed to what is read here. */
export interface StoreProduct {
  id: string;
  /** The price formatted by the store in the lifter's currency, e.g. "₱300.00". */
  displayPrice: string;
}

/**
 * The expo-iap functions the adapter uses, with their expo-iap 6.5.1 shapes. `expoIapAdapter.ts` passes
 * the real ones; tests pass a fake, so Jest never loads the native module.
 */
export interface StoreApi<P extends StorePurchase> {
  initConnection: () => Promise<boolean>;
  fetchProducts: (request: { skus: string[]; type: "in-app" }) => Promise<readonly StoreProduct[] | null>;
  requestPurchase: (props: {
    request: { apple: { sku: string }; google: { skus: string[] } };
    type: "in-app";
  }) => Promise<P | P[] | null>;
  getAvailablePurchases: (options: {
    onlyIncludeActiveItemsIOS: boolean;
    alsoPublishToEventListenerIOS: boolean;
  }) => Promise<P[]>;
  finishTransaction: (args: { purchase: P; isConsumable: boolean }) => Promise<unknown>;
  purchaseUpdatedListener: (listener: (purchase: P) => void) => { remove: () => void };
}

/** How long a store call that needs no lifter input may take before it counts as no answer. */
const DEFAULT_TIMEOUT_MS = 10_000;

/** Rejects when `promise` hasn't settled within `ms`. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`The store didn't answer within ${ms} ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Wraps the store's functions in the guarded Pro calls. No call rejects: every error and timeout
 * becomes "no answer", "failed" or "error".
 */
export function createStoreAdapter<P extends StorePurchase>(
  api: StoreApi<P>,
  { timeoutMs = DEFAULT_TIMEOUT_MS }: { timeoutMs?: number } = {},
): ProStoreAdapter {
  /** The open connection, shared by every call. Cleared when it fails, so the next call tries again. */
  let connection: Promise<boolean> | null = null;

  const connect = async (): Promise<boolean> => {
    connection ??= withTimeout(api.initConnection(), timeoutMs);
    try {
      if (await connection) return true;
    } catch {
      // Falls through: not connected.
    }
    connection = null;
    return false;
  };

  /** Finishes each purchase that needs it as a non-consumable (the Android acknowledge). Never rejects. */
  const finish = async (purchases: readonly P[]): Promise<void> => {
    await Promise.all(
      purchasesToFinish(purchases).map((purchase) =>
        withTimeout(Promise.resolve(api.finishTransaction({ purchase, isConsumable: false })), timeoutMs).catch(() => {
          // Not acknowledged this time; the next check tries again, well inside Google's 3 days.
        }),
      ),
    );
  };

  const checkOwned = async (): Promise<StoreAnswer> => {
    if (!(await connect())) return { kind: "no-answer" };
    try {
      const purchases = await withTimeout(
        api.getAvailablePurchases({ onlyIncludeActiveItemsIOS: true, alsoPublishToEventListenerIOS: false }),
        timeoutMs,
      );
      await finish(purchases);
      return answerFromPurchases(purchases);
    } catch {
      // A dropped connection is opened afresh next time.
      connection = null;
      return { kind: "no-answer" };
    }
  };

  const fetchProduct = async (): Promise<ProProduct> => {
    if (!(await connect())) return { kind: "failed" };
    try {
      const products = await withTimeout(api.fetchProducts({ skus: [PRO_PRODUCT_ID], type: "in-app" }), timeoutMs);
      // The store leaves out a SKU it doesn't know rather than throwing.
      const pro = products?.find((p) => p.id === PRO_PRODUCT_ID);
      return pro ? { kind: "loaded", localizedPrice: pro.displayPrice } : { kind: "failed" };
    } catch {
      connection = null;
      return { kind: "failed" };
    }
  };

  /** Settles a purchase the sheet didn't hand back (or one already owned) by asking what is owned. */
  const buyResultFromStore = async (): Promise<BuyResult> => {
    const answer = await checkOwned();
    if (answer.kind !== "owned") return { kind: "error" };
    return { kind: answer.state };
  };

  const buy = async (): Promise<BuyResult> => {
    if (!(await connect())) return { kind: "error" };
    let result: P | P[] | null;
    try {
      // No timeout: the store's payment sheet stays open as long as the lifter needs.
      result = await api.requestPurchase({
        request: { apple: { sku: PRO_PRODUCT_ID }, google: { skus: [PRO_PRODUCT_ID] } },
        type: "in-app",
      });
    } catch (error) {
      const outcome = buyOutcomeFromError(error);
      return outcome === "already-owned" ? buyResultFromStore() : { kind: outcome };
    }
    // iOS hands back one purchase, Android a list.
    const purchases = result == null ? [] : Array.isArray(result) ? result : [result];
    const answer = answerFromPurchases(purchases);
    if (answer.kind !== "owned") return buyResultFromStore();
    await finish(purchases);
    return { kind: answer.state };
  };

  const onPurchaseUpdate = (listener: (answer: StoreAnswer) => void): (() => void) => {
    try {
      const subscription = api.purchaseUpdatedListener((purchase) => {
        if (purchase.productId !== PRO_PRODUCT_ID) return;
        void finish([purchase]);
        try {
          listener(answerFromPurchases([purchase]));
        } catch {
          // A listener's failure never reaches the store's event emitter.
        }
      });
      return () => subscription.remove();
    } catch {
      // No store to listen to (no native module): nothing will ever arrive.
      return () => {};
    }
  };

  return { connect, fetchProduct, buy, checkOwned, onPurchaseUpdate };
}
