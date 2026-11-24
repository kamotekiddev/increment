import type { ProProduct } from "./storeAdapter";

/** The Pro product as the Paywall sees it: still being fetched, or what the store returned. */
export type PaywallProduct = { kind: "loading" } | ProProduct;

export interface PaywallInputs {
  product: PaywallProduct;
  /** A Pro purchase is waiting for its payment to clear (the Pro store's, or the Paywall's own buy). */
  pending: boolean;
  /** The store's payment sheet is open. */
  inFlight: boolean;
}

export interface PaywallButton {
  label: string;
  enabled: boolean;
  /** A small spinner before the label. */
  spinner: boolean;
  /** Accent fill, or the pale pending look with a clock. */
  look: "accent" | "pending";
  /** The line under the button. */
  line: string;
  /** The line reads as a notice (darker, medium weight) rather than a quiet note. */
  lineStrong: boolean;
}

const USUAL_LINE = "One-time payment. No subscription. Works offline.";

/** The Paywall's button and the line under it. In flight beats pending, and pending beats the product fetch. */
export function paywallState({ product, pending, inFlight }: PaywallInputs): PaywallButton {
  const label = product.kind === "loaded" ? `Unlock Pro · ${product.localizedPrice}` : "Unlock Pro";
  const usual = { label, look: "accent", line: USUAL_LINE, lineStrong: false } as const;
  if (inFlight) return { ...usual, enabled: false, spinner: true };
  if (pending) {
    return {
      label: "Payment pending",
      enabled: false,
      spinner: false,
      look: "pending",
      line: "Pro unlocks when the store confirms your payment.",
      lineStrong: false,
    };
  }
  switch (product.kind) {
    case "loading":
      return { ...usual, enabled: false, spinner: true };
    case "loaded":
      return { ...usual, enabled: true, spinner: false };
    case "failed":
      return { ...usual, enabled: false, spinner: false, line: "Connect to the internet to buy Pro.", lineStrong: true };
  }
}
