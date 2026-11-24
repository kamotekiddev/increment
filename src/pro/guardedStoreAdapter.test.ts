import { createStoreAdapter, type StoreApi } from "./guardedStoreAdapter";
import type { StorePurchase } from "./storeMapping";

function purchase(overrides: Partial<StorePurchase> = {}): StorePurchase {
  return { id: "1000", productId: "pro_lifetime", purchaseState: "purchased", purchaseToken: "token-1", ...overrides };
}

/** A stand-in for expo-iap's functions, shaped like them, recording what the adapter asked. */
class FakeStoreApi implements StoreApi<StorePurchase> {
  connected: boolean | Error = true;
  connectCalls = 0;
  purchases: StorePurchase[] | Error | "never" = [];
  purchaseOptions: unknown[] = [];
  finished: { purchase: StorePurchase; isConsumable: boolean }[] = [];
  finishError: Error | null = null;
  products: { id: string; displayPrice: string }[] | null | Error = [];
  purchaseResult: StorePurchase | StorePurchase[] | null | Error = null;
  updateListeners = new Set<(p: StorePurchase) => void>();

  initConnection = async () => {
    this.connectCalls += 1;
    if (this.connected instanceof Error) throw this.connected;
    return this.connected;
  };

  getAvailablePurchases = (options: unknown) => {
    this.purchaseOptions.push(options);
    const { purchases } = this;
    if (purchases === "never") return new Promise<StorePurchase[]>(() => {});
    return purchases instanceof Error ? Promise.reject(purchases) : Promise.resolve(purchases);
  };

  finishTransaction = async (args: { purchase: StorePurchase; isConsumable: boolean }) => {
    this.finished.push(args);
    if (this.finishError) throw this.finishError;
  };

  fetchProducts = async () => {
    if (this.products instanceof Error) throw this.products;
    return this.products;
  };

  requestPurchase = async () => {
    if (this.purchaseResult instanceof Error) throw this.purchaseResult;
    return this.purchaseResult;
  };

  purchaseUpdatedListener = (listener: (p: StorePurchase) => void) => {
    this.updateListeners.add(listener);
    return { remove: () => this.updateListeners.delete(listener) };
  };

  emit(p: StorePurchase) {
    this.updateListeners.forEach((listener) => listener(p));
  }
}

/** An error shaped like expo-iap's PurchaseError. */
function storeError(code: string): Error {
  return Object.assign(new Error(code), { code });
}

describe("asking what is owned", () => {
  it("a thrown query error is no answer", async () => {
    const api = new FakeStoreApi();
    api.purchases = new Error("billing unavailable");
    await expect(createStoreAdapter(api).checkOwned()).resolves.toEqual({ kind: "no-answer" });
  });

  it("an empty list is not owned, and a purchased Pro is owned", async () => {
    const api = new FakeStoreApi();
    const adapter = createStoreAdapter(api);
    await expect(adapter.checkOwned()).resolves.toEqual({ kind: "not-owned" });
    api.purchases = [purchase()];
    await expect(adapter.checkOwned()).resolves.toMatchObject({ kind: "owned", state: "purchased" });
  });

  it("reads only active items on iOS (current entitlements, never refunded history)", async () => {
    const api = new FakeStoreApi();
    await createStoreAdapter(api).checkOwned();
    expect(api.purchaseOptions).toEqual([{ onlyIncludeActiveItemsIOS: true, alsoPublishToEventListenerIOS: false }]);
  });

  it("is no answer when the store can't connect, and tries to connect again on the next check", async () => {
    const api = new FakeStoreApi();
    api.connected = new Error("no Play Store");
    api.purchases = [purchase()];
    const adapter = createStoreAdapter(api);
    await expect(adapter.checkOwned()).resolves.toEqual({ kind: "no-answer" });

    api.connected = true;
    await expect(adapter.checkOwned()).resolves.toMatchObject({ kind: "owned" });
    expect(api.connectCalls).toBe(2);
  });

  it("connects once for many checks", async () => {
    const api = new FakeStoreApi();
    const adapter = createStoreAdapter(api);
    await adapter.checkOwned();
    await adapter.checkOwned();
    expect(api.connectCalls).toBe(1);
  });

  it("a store that never answers times out as no answer", async () => {
    jest.useFakeTimers();
    try {
      const api = new FakeStoreApi();
      api.purchases = "never";
      const answer = createStoreAdapter(api, { timeoutMs: 10_000 }).checkOwned();
      await jest.advanceTimersByTimeAsync(10_000);
      await expect(answer).resolves.toEqual({ kind: "no-answer" });
    } finally {
      jest.useRealTimers();
    }
  });

  it("finishes an unacknowledged Pro as a non-consumable on every check", async () => {
    const api = new FakeStoreApi();
    const unacknowledged = purchase({ isAcknowledgedAndroid: false });
    api.purchases = [unacknowledged, purchase({ productId: "other", isAcknowledgedAndroid: false })];
    await createStoreAdapter(api).checkOwned();
    expect(api.finished).toEqual([{ purchase: unacknowledged, isConsumable: false }]);
  });

  it("a failed finish still answers owned", async () => {
    const api = new FakeStoreApi();
    api.purchases = [purchase({ isAcknowledgedAndroid: false })];
    api.finishError = new Error("service disconnected");
    await expect(createStoreAdapter(api).checkOwned()).resolves.toMatchObject({ kind: "owned" });
  });
});

describe("guarded calls that throw or stall", () => {
  it("answers without waiting for a slow acknowledge, which still happens on every check", async () => {
    const api = new FakeStoreApi();
    api.purchases = [purchase({ isAcknowledgedAndroid: false })];
    let finishCalls = 0;
    api.finishTransaction = () => {
      finishCalls += 1;
      return new Promise(() => {});
    };
    const adapter = createStoreAdapter(api);
    await expect(adapter.checkOwned()).resolves.toMatchObject({ kind: "owned" });
    await expect(adapter.checkOwned()).resolves.toMatchObject({ kind: "owned" });
    expect(finishCalls).toBe(2);
  });

  it("a finishTransaction that throws synchronously never rejects a check", async () => {
    const api = new FakeStoreApi();
    api.purchases = [purchase({ isAcknowledgedAndroid: false })];
    api.finishTransaction = () => {
      throw new Error("native module missing");
    };
    await expect(createStoreAdapter(api).checkOwned()).resolves.toMatchObject({ kind: "owned" });
  });

  it("an initConnection that throws synchronously is no answer, and connects again next time", async () => {
    const api = new FakeStoreApi();
    let calls = 0;
    api.initConnection = () => {
      calls += 1;
      if (calls === 1) throw new Error("native module missing");
      return Promise.resolve(true);
    };
    const adapter = createStoreAdapter(api);
    await expect(adapter.checkOwned()).resolves.toEqual({ kind: "no-answer" });
    await expect(adapter.fetchProduct()).resolves.toEqual({ kind: "failed" });
    expect(calls).toBe(2);
  });

  it("a failed purchase request drops the connection, so the next call connects afresh", async () => {
    const api = new FakeStoreApi();
    api.purchaseResult = storeError("network-error");
    const adapter = createStoreAdapter(api);
    await adapter.buy();
    await adapter.checkOwned();
    expect(api.connectCalls).toBe(2);
  });

  it("a cancelled purchase keeps the connection", async () => {
    const api = new FakeStoreApi();
    api.purchaseResult = storeError("user-cancelled");
    const adapter = createStoreAdapter(api);
    await adapter.buy();
    await adapter.checkOwned();
    expect(api.connectCalls).toBe(1);
  });

  it("a late failure of an old call never discards a newer connection", async () => {
    const api = new FakeStoreApi();
    const pending: { resolve: (p: StorePurchase[]) => void; reject: (e: Error) => void }[] = [];
    api.getAvailablePurchases = () =>
      new Promise<StorePurchase[]>((resolve, reject) => {
        pending.push({ resolve, reject });
      });
    const adapter = createStoreAdapter(api);
    const a = adapter.checkOwned();
    const c = adapter.checkOwned();
    await new Promise((r) => setTimeout(r, 0));
    expect(pending).toHaveLength(2);
    // A fails and drops connection 1; the next check opens connection 2.
    pending[0].reject(new Error("dropped"));
    await a;
    const b = adapter.checkOwned();
    await new Promise((r) => setTimeout(r, 0));
    expect(api.connectCalls).toBe(2);
    // C fails late, on the old connection. Connection 2 must survive.
    pending[1].reject(new Error("late"));
    await c;
    pending[2].resolve([]);
    await b;
    const d = adapter.checkOwned();
    await new Promise((r) => setTimeout(r, 0));
    pending[3].resolve([]);
    await d;
    expect(api.connectCalls).toBe(2);
  });
});

describe("fetching the Pro product", () => {
  it("returns the store's localized price string", async () => {
    const api = new FakeStoreApi();
    api.products = [{ id: "pro_lifetime", displayPrice: "₱300.00" }];
    await expect(createStoreAdapter(api).fetchProduct()).resolves.toEqual({ kind: "loaded", localizedPrice: "₱300.00" });
  });

  it("fails when the store doesn't list Pro", async () => {
    const api = new FakeStoreApi();
    api.products = [{ id: "something_else", displayPrice: "₱50.00" }];
    await expect(createStoreAdapter(api).fetchProduct()).resolves.toEqual({ kind: "failed" });
    api.products = null;
    await expect(createStoreAdapter(api).fetchProduct()).resolves.toEqual({ kind: "failed" });
  });

  it("fails when the store errors or can't connect", async () => {
    const api = new FakeStoreApi();
    api.products = new Error("network");
    await expect(createStoreAdapter(api).fetchProduct()).resolves.toEqual({ kind: "failed" });

    const offline = new FakeStoreApi();
    offline.connected = false;
    offline.products = [{ id: "pro_lifetime", displayPrice: "₱300.00" }];
    await expect(createStoreAdapter(offline).fetchProduct()).resolves.toEqual({ kind: "failed" });
  });
});

describe("buying Pro", () => {
  it("a purchase (iOS returns one object) is purchased, and is finished as a non-consumable right away", async () => {
    const api = new FakeStoreApi();
    const bought = purchase();
    api.purchaseResult = bought;
    await expect(createStoreAdapter(api).buy()).resolves.toEqual({ kind: "purchased" });
    expect(api.finished).toEqual([{ purchase: bought, isConsumable: false }]);
  });

  it("a purchase in a list (Android) is purchased", async () => {
    const api = new FakeStoreApi();
    api.purchaseResult = [purchase({ isAcknowledgedAndroid: false })];
    await expect(createStoreAdapter(api).buy()).resolves.toEqual({ kind: "purchased" });
    expect(api.finished).toHaveLength(1);
  });

  it("a pending purchase is pending and isn't finished", async () => {
    const api = new FakeStoreApi();
    api.purchaseResult = [purchase({ purchaseState: "pending", isAcknowledgedAndroid: false })];
    await expect(createStoreAdapter(api).buy()).resolves.toEqual({ kind: "pending" });
    expect(api.finished).toEqual([]);
  });

  it("closing the payment sheet is cancelled", async () => {
    const api = new FakeStoreApi();
    api.purchaseResult = storeError("user-cancelled");
    await expect(createStoreAdapter(api).buy()).resolves.toEqual({ kind: "cancelled" });
  });

  it("Ask to Buy (StoreKit's deferred payment) is pending, not an error", async () => {
    const api = new FakeStoreApi();
    api.purchaseResult = storeError("deferred-payment");
    await expect(createStoreAdapter(api).buy()).resolves.toEqual({ kind: "pending" });
    api.purchaseResult = storeError("pending");
    await expect(createStoreAdapter(api).buy()).resolves.toEqual({ kind: "pending" });
  });

  it("any other failure is an error", async () => {
    const api = new FakeStoreApi();
    api.purchaseResult = storeError("network-error");
    await expect(createStoreAdapter(api).buy()).resolves.toEqual({ kind: "error" });
    api.purchaseResult = new Error("something odd");
    await expect(createStoreAdapter(api).buy()).resolves.toEqual({ kind: "error" });
  });

  it("an error when the store can't connect", async () => {
    const api = new FakeStoreApi();
    api.connected = false;
    api.purchaseResult = purchase();
    await expect(createStoreAdapter(api).buy()).resolves.toEqual({ kind: "error" });
  });

  it("when the sheet returns no purchase, asks the store what is owned", async () => {
    const api = new FakeStoreApi();
    api.purchaseResult = null;
    api.purchases = [purchase()];
    await expect(createStoreAdapter(api).buy()).resolves.toEqual({ kind: "purchased" });
    api.purchases = [];
    await expect(createStoreAdapter(api).buy()).resolves.toEqual({ kind: "error" });
  });

  it("already owned asks the store, so a lifter who owns Pro gets it", async () => {
    const api = new FakeStoreApi();
    api.purchaseResult = storeError("already-owned");
    api.purchases = [purchase()];
    await expect(createStoreAdapter(api).buy()).resolves.toEqual({ kind: "purchased" });
  });
});

describe("purchase updates from the store", () => {
  it("passes on a Pro purchase's answer and finishes it as a non-consumable", async () => {
    const api = new FakeStoreApi();
    const answers: unknown[] = [];
    createStoreAdapter(api).onPurchaseUpdate((answer) => answers.push(answer));
    const cleared = purchase({ isAcknowledgedAndroid: false, purchaseToken: "cleared" });
    api.emit(cleared);
    await Promise.resolve();
    expect(answers).toEqual([{ kind: "owned", productId: "pro_lifetime", proof: "cleared", state: "purchased" }]);
    expect(api.finished).toEqual([{ purchase: cleared, isConsumable: false }]);
  });

  it("ignores other products", () => {
    const api = new FakeStoreApi();
    const listener = jest.fn();
    createStoreAdapter(api).onPurchaseUpdate(listener);
    api.emit(purchase({ productId: "something_else" }));
    expect(listener).not.toHaveBeenCalled();
  });

  it("stops after unsubscribing", () => {
    const api = new FakeStoreApi();
    const listener = jest.fn();
    const unsubscribe = createStoreAdapter(api).onPurchaseUpdate(listener);
    unsubscribe();
    api.emit(purchase());
    expect(listener).not.toHaveBeenCalled();
  });

  it("a store that can't take a listener gives a harmless unsubscribe", () => {
    const api = new FakeStoreApi();
    api.purchaseUpdatedListener = () => {
      throw new Error("native module missing");
    };
    const unsubscribe = createStoreAdapter(api).onPurchaseUpdate(jest.fn());
    expect(unsubscribe).not.toThrow();
  });
});
