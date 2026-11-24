import type { StoreAnswer } from "./entitlementDecision";
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

/** How a Restore purchase check ended. */
export type RestoreOutcome = "found" | "pending" | "nothing-found" | "no-answer";

/** The Restore outcome for the store's answer to "what is owned". */
export function restoreOutcome(answer: StoreAnswer): RestoreOutcome {
  switch (answer.kind) {
    case "owned":
      return answer.state === "purchased" ? "found" : "pending";
    case "not-owned":
      return "nothing-found";
    case "no-answer":
      return "no-answer";
  }
}

/** What the Paywall does after Restore purchase: nothing of its own, or one native alert with OK. */
export type RestoreResult = { kind: "none" } | { kind: "alert"; title: string; body: string };

/**
 * The Restore purchase result for an outcome on this platform. Found and pending need nothing here: the
 * Pro store's switch to Pro opens Pro unlocked, and its pending flag gives the Payment pending state.
 * Only Android gets the Google copy.
 */
export function restoreResult(outcome: RestoreOutcome, platform: string): RestoreResult {
  const android = platform === "android";
  if (outcome === "found" || outcome === "pending") return { kind: "none" };
  if (outcome === "no-answer") {
    return {
      kind: "alert",
      title: android ? "Couldn't reach Google Play" : "Couldn't reach the App Store",
      body: "Check your connection and try again.",
    };
  }
  return {
    kind: "alert",
    title: "No purchase found",
    body: `Make sure you're signed in with the ${android ? "Google account" : "Apple ID"} you bought Pro with.`,
  };
}

const USUAL_LINE ="One-time payment. No subscription. Works offline.";

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
