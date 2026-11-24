/**
 * Where `isPro` comes from, for testing on a dev build: the store's answer (the cached row), or forced
 * Pro or Free. In memory only: it resets to Store on every launch and never writes `entitlements`.
 */
export type ProSource = "store" | "pro" | "free";

export interface ProFlags {
  isPro: boolean;
  /** A Pro purchase is waiting for its payment to clear. */
  pending: boolean;
}

/** The Pro state screens see. Store passes the stored value through; Pro and Free override it, and Free ignores pending. */
export function applyDevSource(stored: ProFlags, source: ProSource): ProFlags {
  switch (source) {
    case "store":
      return stored;
    case "pro":
      return { isPro: true, pending: stored.pending };
    case "free":
      return { isPro: false, pending: false };
  }
}
