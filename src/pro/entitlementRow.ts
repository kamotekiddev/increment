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

/** Saves the store's answer. An upsert on id 1, since no row exists until the first answer. Leaves the owed flag as it is. */
export function writeEntitlement(q: SelectInsertDb, row: EntitlementRow): void {
  q.insert(entitlements)
    .values({ id: ROW_ID, ...row })
    .onConflictDoUpdate({ target: entitlements.id, set: row })
    .run();
}

/** Whether Pro unlocked is still owed: Pro switched on during a live workout and the screen hasn't shown yet. */
export function readUnlockScreenOwed(q: SelectInsertDb): boolean {
  return q.select({ owed: entitlements.unlockScreenOwed }).from(entitlements).get()?.owed ?? false;
}

/** Sets or clears the owed Pro unlocked screen. Never touches the cached purchase. */
export function writeUnlockScreenOwed(q: SelectInsertDb, owed: boolean): void {
  q.insert(entitlements)
    .values({ id: ROW_ID, unlockScreenOwed: owed })
    .onConflictDoUpdate({ target: entitlements.id, set: { unlockScreenOwed: owed } })
    .run();
}
