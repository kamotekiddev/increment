import { createStore } from "zustand/vanilla";

import type { SelectInsertDb } from "@/db/client";

import { decideEntitlement, type StoreAnswer } from "./entitlementDecision";
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
  onSwitchedOn: (listener: () => void) => () => void;
}

/** Pro as shared state, backed by the entitlements row. Free until `load` runs. */
export function createProStore(db: SelectInsertDb, adapter: ProStoreAdapter, now: () => number = Date.now) {
  let stored: ProFlags = { isPro: false, pending: false };
  /** Refreshes queue behind each other, so two never interleave. Each reads the latest row when its turn comes. */
  let queue: Promise<unknown> = Promise.resolve();
  const listeners = new Set<() => void>();

  return createStore<ProState>((set, get) => {
    /** Publishes the effective state, and tells listeners when Pro switched on (unless this is the launch read). */
    const show = (announce: boolean) => {
      const wasPro = get()?.isPro ?? false;
      const next = applyDevSource(stored, get()?.source ?? "store");
      set(next);
      if (!announce || wasPro || !next.isPro) return;
      listeners.forEach((listener) => {
        try {
          listener();
        } catch {
          // One listener's failure never stops the others or the caller.
        }
      });
    };

    const runRefresh = async (): Promise<StoreAnswer> => {
      try {
        const answer = await adapter.checkOwned().catch((): StoreAnswer => ({ kind: "no-answer" }));
        const decision = decideEntitlement(readEntitlement(db), answer, now());
        if (decision.write) writeEntitlement(db, decision.row);
        // No answer leaves everything as it was, including a pending purchase still waiting to clear.
        const pending = answer.kind === "no-answer" ? stored.pending : decision.pending;
        stored = { isPro: decision.row.isPro, pending };
        show(true);
        return answer;
      } catch {
        // A database error leaves the last known state in place; the next check tries again.
        return { kind: "no-answer" };
      }
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
        show(true);
      },
      onSwitchedOn: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
    };
  });
}
