import { createStore } from "zustand/vanilla";

import type { SelectInsertDb } from "@/db/client";

import { decideEntitlement, type EntitlementRow, type StoreAnswer } from "./entitlementDecision";
import { applyDevSource, type ProFlags, type ProSource } from "./devSource";
import { readEntitlement, writeEntitlement } from "./entitlementRow";
import type { ProStoreAdapter } from "./storeAdapter";

export interface ProState {
  /** Effective Pro, after the dev source. The one gate every feature reads. */
  isPro: boolean;
  /** A Pro purchase is waiting for its payment to clear (after the dev source). */
  pending: boolean;
  /** Where `isPro` comes from. Store on every launch; dev builds can force Pro or Free. */
  source: ProSource;
  /** Reads the cached row. Call once the migrations have run. Never asks the store and never fires "switched on". */
  load: () => void;
  /**
   * Asks the store what is owned and writes the answer through the entitlement decision. Serialised; never
   * rejects. Resolves with the answer it acted on, or no answer when the store or the database failed.
   */
  refresh: () => Promise<StoreAnswer>;
  /** Sets the dev source. In memory only: nothing is written. */
  setSource: (source: ProSource) => void;
  /**
   * Calls `listener` each time the effective `isPro` goes from false to true, from a store answer or a
   * dev source change alike. Returns an unsubscribe function.
   */
  onSwitchedOn: (listener: (info: SwitchedOnInfo) => void) => () => void;
}

/** What a switched-on listener is told. */
export interface SwitchedOnInfo {
  /** The dev source caused it, not the store. Nothing about it may be persisted: the real row is untouched. */
  fromDevSource: boolean;
}

/** Pro as shared state, backed by the entitlements row. Free until `load` runs. */
export function createProStore(db: SelectInsertDb, adapter: ProStoreAdapter, now: () => number = Date.now) {
  let stored: ProFlags = { isPro: false, pending: false };
  /** Refreshes queue behind each other, so two never interleave. Each reads the latest row when its turn comes. */
  let queue: Promise<unknown> = Promise.resolve();
  const listeners = new Set<(info: SwitchedOnInfo) => void>();

  return createStore<ProState>((set, get) => {
    /** Publishes the effective state, and tells listeners when Pro switched on (unless this is the launch read). */
    const show = (announce: boolean, fromDevSource = false) => {
      const wasPro = get()?.isPro ?? false;
      const next = applyDevSource(stored, get()?.source ?? "store");
      set(next);
      if (!announce || wasPro || !next.isPro) return;
      listeners.forEach((listener) => {
        try {
          listener({ fromDevSource });
        } catch {
          // One listener's failure never stops the others or the caller.
        }
      });
    };

    const runRefresh = async (): Promise<StoreAnswer> => {
      const answer = await adapter.checkOwned().catch((): StoreAnswer => ({ kind: "no-answer" }));
      try {
        let cached: EntitlementRow | null;
        try {
          cached = readEntitlement(db);
        } catch {
          // An unreadable row: go by what this session last knew.
          cached = { isPro: stored.isPro, productId: null, proof: null, verifiedAt: null };
        }
        const decision = decideEntitlement(cached, answer, now());
        if (decision.write) {
          try {
            writeEntitlement(db, decision.row);
          } catch {
            // The store's answer still holds for this session; the next check writes it again.
          }
        }
        // No answer leaves everything as it was, including a pending purchase still waiting to clear.
        const pending = answer.kind === "no-answer" ? stored.pending : decision.pending;
        stored = { isPro: decision.row.isPro, pending };
        show(true);
      } catch {
        // Anything else that fails leaves the last known state; the store's answer is still returned.
      }
      return answer;
    };

    return {
      isPro: false,
      pending: false,
      source: "store",
      load: () => {
        stored = { isPro: readEntitlement(db)?.isPro ?? false, pending: false };
        show(false);
      },
      refresh: () => {
        const run = queue.then(runRefresh, runRefresh);
        queue = run;
        return run;
      },
      setSource: (source) => {
        set({ source });
        show(true, true);
      },
      onSwitchedOn: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
  });
}
