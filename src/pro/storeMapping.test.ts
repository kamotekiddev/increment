import { answerFromPurchases, purchasesToFinish, type StorePurchase } from "./storeMapping";

/** A Pro purchase as expo-iap reports it, trimmed to what the mapping reads. */
function purchase(overrides: Partial<StorePurchase> = {}): StorePurchase {
  return { id: "1000", productId: "pro_lifetime", purchaseState: "purchased", purchaseToken: "token-1", ...overrides };
}

describe("what the store says is owned", () => {
  it("an empty list is a definite not owned", () => {
    expect(answerFromPurchases([])).toEqual({ kind: "not-owned" });
  });

  it("a purchased Pro is owned, with its token as the proof", () => {
    expect(answerFromPurchases([purchase({ purchaseToken: "jws-abc" })])).toEqual({
      kind: "owned",
      productId: "pro_lifetime",
      proof: "jws-abc",
      state: "purchased",
    });
  });

  it("a pending Pro (cash payment, Ask to Buy) is owned but pending", () => {
    expect(answerFromPurchases([purchase({ purchaseState: "pending" })])).toEqual({
      kind: "owned",
      productId: "pro_lifetime",
      proof: "token-1",
      state: "pending",
    });
  });

  it("purchased beats pending when the store lists both", () => {
    const answer = answerFromPurchases([
      purchase({ purchaseState: "pending", purchaseToken: "pending-token" }),
      purchase({ purchaseToken: "paid-token" }),
    ]);
    expect(answer).toEqual({ kind: "owned", productId: "pro_lifetime", proof: "paid-token", state: "purchased" });
  });

  it("a Pro purchase in an unknown state is no answer, so a real buyer never loses Pro", () => {
    expect(answerFromPurchases([purchase({ purchaseState: "unknown" })])).toEqual({ kind: "no-answer" });
  });

  it("other products don't count", () => {
    expect(answerFromPurchases([purchase({ productId: "something_else" })])).toEqual({ kind: "not-owned" });
  });

  it("a purchase Apple revoked doesn't count", () => {
    expect(answerFromPurchases([purchase({ revocationDateIOS: 1_700_000_000_000 })])).toEqual({ kind: "not-owned" });
  });

  it("falls back to the transaction id when the store gives no token", () => {
    expect(answerFromPurchases([purchase({ id: "2000", purchaseToken: null })])).toMatchObject({ proof: "2000" });
  });
});

describe("which purchases to finish (the Android acknowledge)", () => {
  it("finishes a purchased Pro Google hasn't acknowledged yet", () => {
    const unacknowledged = purchase({ isAcknowledgedAndroid: false });
    expect(purchasesToFinish([unacknowledged])).toEqual([unacknowledged]);
  });

  it("leaves an acknowledged one alone", () => {
    expect(purchasesToFinish([purchase({ isAcknowledgedAndroid: true })])).toEqual([]);
  });

  it("never finishes a pending purchase, since its payment hasn't cleared", () => {
    expect(purchasesToFinish([purchase({ purchaseState: "pending", isAcknowledgedAndroid: false })])).toEqual([]);
  });

  it("finishes an iOS Pro purchase (no acknowledged flag), so StoreKit stops replaying it", () => {
    const ios = purchase();
    expect(purchasesToFinish([ios])).toEqual([ios]);
  });

  it("never touches other products", () => {
    expect(purchasesToFinish([purchase({ productId: "something_else", isAcknowledgedAndroid: false })])).toEqual([]);
  });
});
