import type { SelectInsertDb } from "@/db/client";
import { entitlements } from "@/db/schema";

import type { EntitlementRow } from "./entitlementDecision";

/** The one entitlements row. */
const ROW_ID = 1;

/** The cached Pro purchase, or null when the store has never given a definite answer. */
export function readEntitlement(q: SelectInsertDb): EntitlementRow | null {
  const row = q
    .select({
      isPro: entitlements.isPro,
      productId: entitlements.productId,
      proof: entitlements.proof,
      verifiedAt: entitlements.verifiedAt,
    })
    .from(entitlements)
    .get();
  return row ?? null;
}

/** Saves the store's answer. An upsert on id 1, since no row exists until the first answer. */
export function writeEntitlement(q: SelectInsertDb, row: EntitlementRow): void {
  q.insert(entitlements)
    .values({ id: ROW_ID, ...row })
    .onConflictDoUpdate({ target: entitlements.id, set: row })
    .run();
}
