import { paywallState, restoreOutcome, restoreResult } from "./paywallState";

const loaded = { kind: "loaded", localizedPrice: "₱300.00" } as const;
const usualLine = "One-time payment. No subscription. Works offline.";

describe("Paywall state", () => {
  it("while the price loads: Unlock Pro, disabled, with a spinner and the usual line", () => {
    expect(paywallState({ product: { kind: "loading" }, pending: false, inFlight: false })).toEqual({
      label: "Unlock Pro",
      enabled: false,
      spinner: true,
      look: "accent",
      line: usualLine,
      lineStrong: false,
    });
  });

  it("with the price loaded: Unlock Pro and the store's localized price, enabled", () => {
    expect(paywallState({ product: loaded, pending: false, inFlight: false })).toEqual({
      label: "Unlock Pro · ₱300.00",
      enabled: true,
      spinner: false,
      look: "accent",
      line: usualLine,
      lineStrong: false,
    });
  });

  it("with the store unreachable: Unlock Pro, disabled, and asks for a connection", () => {
    expect(paywallState({ product: { kind: "failed" }, pending: false, inFlight: false })).toEqual({
      label: "Unlock Pro",
      enabled: false,
      spinner: false,
      look: "accent",
      line: "Connect to the internet to buy Pro.",
      lineStrong: true,
    });
  });

  it("with a payment pending: Payment pending, disabled, in the pending look", () => {
    expect(paywallState({ product: loaded, pending: true, inFlight: false })).toEqual({
      label: "Payment pending",
      enabled: false,
      spinner: false,
      look: "pending",
      line: "Pro unlocks when the store confirms your payment.",
      lineStrong: false,
    });
  });

  it("pending beats the product, whatever the fetch did", () => {
    for (const product of [{ kind: "loading" }, { kind: "failed" }, loaded] as const) {
      expect(paywallState({ product, pending: true, inFlight: false }).label).toBe("Payment pending");
    }
  });

  it("while the store's sheet is open: disabled with a spinner, keeping the price", () => {
    expect(paywallState({ product: loaded, pending: false, inFlight: true })).toEqual({
      label: "Unlock Pro · ₱300.00",
      enabled: false,
      spinner: true,
      look: "accent",
      line: usualLine,
      lineStrong: false,
    });
  });

  it("in flight beats pending", () => {
    const state = paywallState({ product: loaded, pending: true, inFlight: true });
    expect(state).toMatchObject({ enabled: false, spinner: true, look: "accent" });
    expect(state.label).toBe("Unlock Pro · ₱300.00");
  });
});

describe("Restore purchase outcome", () => {
  it("reads the store's answer: purchased is found, pending is pending, not owned is nothing found", () => {
    expect(restoreOutcome({ kind: "owned", productId: "pro_lifetime", proof: "t", state: "purchased" })).toBe("found");
    expect(restoreOutcome({ kind: "owned", productId: "pro_lifetime", proof: "t", state: "pending" })).toBe("pending");
    expect(restoreOutcome({ kind: "not-owned" })).toBe("nothing-found");
    expect(restoreOutcome({ kind: "no-answer" })).toBe("no-answer");
  });
});

describe("Restore purchase result", () => {
  it("nothing found: an alert naming the account to sign in with, Apple ID on iOS and Google account on Android", () => {
    expect(restoreResult("nothing-found", "ios")).toEqual({
      kind: "alert",
      title: "No purchase found",
      body: "Make sure you're signed in with the Apple ID you bought Pro with.",
    });
    expect(restoreResult("nothing-found", "android")).toEqual({
      kind: "alert",
      title: "No purchase found",
      body: "Make sure you're signed in with the Google account you bought Pro with.",
    });
  });

  it("no answer: an alert naming the store that couldn't be reached, App Store on iOS and Google Play on Android", () => {
    expect(restoreResult("no-answer", "ios")).toEqual({
      kind: "alert",
      title: "Couldn't reach the App Store",
      body: "Check your connection and try again.",
    });
    expect(restoreResult("no-answer", "android")).toEqual({
      kind: "alert",
      title: "Couldn't reach Google Play",
      body: "Check your connection and try again.",
    });
  });

  it("found and pending show no alert on either platform: Pro unlocked or the Payment pending state takes over", () => {
    for (const platform of ["ios", "android"]) {
      expect(restoreResult("found", platform)).toEqual({ kind: "none" });
      expect(restoreResult("pending", platform)).toEqual({ kind: "none" });
    }
  });
});
