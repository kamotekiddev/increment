# 04: Store adapter and the device check

**What to build:** The real store adapter behind ticket 01's interface. Then prove on both phones the assumptions ADR 0004 rests on, before anything else builds on them.

**Blocked by:** 01, 03

**Status:** ready-for-agent (the device checks are ready-for-human)

- [x] The adapter has four calls: connect, fetch the Pro product (localized price string), buy, and ask what is owned. Asking what is owned maps to owned+purchased, owned+pending, not owned, or no answer. Every error and timeout becomes "no answer".
- [x] Any purchased but unacknowledged `pro_lifetime` is finished with `isConsumable: false` (the Android acknowledge) on every check.
- [x] The adapter never imports into Jest code paths; tests keep using the fake.
- [ ] **Owner, on an iPhone and an Android phone.** Write each result in this file under `## Comments`.
  - Buy `pro_lifetime` with a test account. Turn on airplane mode, kill the app and relaunch: asking what is owned still returns **owned**.
  - Android, on a Pro install, with the Play Store signed out or disabled: does asking come back as an **error** or as an **empty list**? If it's an empty list, the adapter must map that case to "no answer", never "not owned", or a real buyer loses Pro.
  - iOS, on a Pro install, signed out of the Apple ID in Settings: the same question.
  - iOS: a launch and a return to the foreground never show an App Store sign-in or password prompt. If expo-iap's "what is owned" call prompts, the launch check uses a silent call and only the Restore button uses the syncing one (update the spec).
- [ ] If any check shows the store can't tell "not owned" from "can't answer", or that it answers nothing offline, stop and bring it back to the owner, since ADR 0004 then needs revisiting.

## Comments

**2026-11-24, owner decision:** tickets 04 to 08 are built now, ahead of ticket 03 and the device checks. Nothing waits on a store account; the owner signs up for Apple Developer and Play Console closer to release. The adapter is written against expo-iap's docs. The device-check boxes above stay open for the owner, and a failed check changes only the adapter. Ticket 04 also adds a local StoreKit configuration file (`pro_lifetime`, ₱300) with the steps to use it in the iOS Simulator, so the purchase flow can be tried before Apple's account exists.

**2026-11-24, agent (code done; the device-check boxes stay with the owner):**

- **Interface** (`src/pro/storeAdapter.ts`): `connect`, `fetchProduct` (`loaded` with `localizedPrice` / `failed`), `buy` (`purchased` / `pending` / `cancelled` / `error`), `checkOwned` (the `StoreAnswer` from ticket 01), and `onPurchaseUpdate(listener)`, which returns an unsubscribe function. No call rejects. `noAnswerAdapter` and `FakeProStoreAdapter` implement it too.
- **Layout:**
  - `storeMapping.ts` is pure. It maps a purchase list to the answer: purchased beats pending; an empty list or no `pro_lifetime` is not owned; a `pro_lifetime` in an `unknown` state is no answer. It also picks the purchases to finish: purchased, not acknowledged, never pending.
  - `guardedStoreAdapter.ts` wraps a `StoreApi` shaped like expo-iap's functions. It handles the shared connection (retried after a failure), a 10 s timeout on every call except the payment sheet, the finishes, and errors.
  - `expoIapAdapter.ts` is the only file that imports expo-iap. An ESLint `no-restricted-imports` rule enforces that, and Jest maps `expo-iap` to `test-support/expoIapStub.ts`.
  - `usePro.ts` now builds the Pro store on the real adapter. Nothing calls `refresh()` yet (ticket 05).
- **"What is owned"** is `getAvailablePurchases({ onlyIncludeActiveItemsIOS: true, alsoPublishToEventListenerIOS: false })`. The flag is passed explicitly, because OpenIAP's Swift default is `false`, which reads `Transaction.all`, refunded transactions included. A purchase with `revocationDateIOS` set is ignored as well.
- **iOS sign-in prompt: none expected for the launch check.** With active items only, `getAvailablePurchases` iterates StoreKit 2's `Transaction.currentEntitlements` and never calls `AppStore.sync` ([openiap.dev get-available-purchases](https://openiap.dev/docs/apis/get-available-purchases); OpenIAP `packages/apple/Sources/OpenIapStoreKitModule.swift`, `getAvailablePurchases`). `restorePurchases` calls `AppStore.sync()`, which "asks the user to authenticate" ([openiap.dev restore-purchases](https://openiap.dev/docs/apis/restore-purchases)). So the launch check and Restore both use `checkOwned`, and the adapter never calls `restorePurchases`. The Swift I read is OpenIAP `main`, not the apple 4.2.1 that expo-iap 6.5.1 pins, so the iOS device check still decides. If a lifter on a new phone isn't found without a sync, ticket 07 could add `restorePurchases` behind the Restore button only.
- **API surprises (expo-iap 6.5.1):**
  - iOS reports Ask to Buy by having `requestPurchase` reject with `deferred-payment`; it never resolves with a pending purchase. The adapter maps `deferred-payment` and `pending` to pending, not error.
  - `requestPurchase` resolves with one `Purchase` on iOS and a `Purchase[]` on Android, though the docs say not to rely on the return value. When it resolves with no `pro_lifetime`, or rejects with `already-owned`, `buy` asks what is owned and answers from that.
  - iOS purchases always come back `purchased`.
  - iOS `finishTransaction` on an already finished transaction is a no-op, so every check finishes iOS Pro purchases (there is no acknowledged flag on iOS). Android skips any with `isAcknowledgedAndroid: true`.
  - Android doesn't connect on its own: calls before `initConnection` reject with `not-prepared`. The adapter connects first.
  - Checked in the Android bridge (`ExpoIapModule.kt`) and OpenIAP Play `main`. The `requestPurchase` promise waits until the Play sheet closes: it suspends until `onPurchasesUpdated`. A cancel, or any failure after launch, rejects the promise and doesn't just emit `purchase-error`. So `buy` can await it, with no race against the listeners. A second `initConnection` on a ready client returns `true` without rejecting, so reconnecting after a failed query is safe.
- **Still for the owner's device check:** Android with Play signed out or disabled. If that comes back as an empty list, the mapping turns it into not owned, which is the case this ticket must catch. The fix would go in `storeMapping.ts` / `guardedStoreAdapter.ts`.
- **StoreKit file:** `storekit/Increment.storekit` (`pro_lifetime`, non-consumable, ₱300, PHL storefront). How to use it: `docs/testing-purchases.md`.
