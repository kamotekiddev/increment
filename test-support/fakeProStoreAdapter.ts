import type { ProStoreAdapter } from "../src/pro/storeAdapter";
import type { StoreAnswer } from "../src/pro/entitlementDecision";

/**
 * A stand-in for the phone's store. Test use only. It answers `answer`, or, after `hold()`, makes each
 * call wait until `release()` so a test can overlap calls.
 */
export class FakeProStoreAdapter implements ProStoreAdapter {
  answer: StoreAnswer = { kind: "no-answer" };
  /** How many times the store was asked what is owned. */
  calls = 0;
  private held = false;
  private waiting: (() => void)[] = [];

  checkOwned = (): Promise<StoreAnswer> => {
    this.calls += 1;
    if (!this.held) return Promise.resolve(this.answer);
    return new Promise((resolve) => this.waiting.push(() => resolve(this.answer)));
  };

  /** Calls from now on wait for `release`. */
  hold(): void {
    this.held = true;
  }

  /** Lets the oldest waiting call answer. */
  release(): void {
    this.waiting.shift()?.();
  }
}

/** Purchased Pro, as the store reports it. */
export function ownedAnswer(proof = "token-1"): StoreAnswer {
  return { kind: "owned", productId: "pro_lifetime", proof, state: "purchased" };
}
