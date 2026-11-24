import { paywallState } from "./paywallState";

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
