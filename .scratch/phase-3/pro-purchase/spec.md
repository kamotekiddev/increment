Status: ready-for-agent

# Phase 3 · Feature 1 · Pro purchase and restore

Part of Phase 3 (see `.scratch/phase-3/map.md`). Needs Phase 2. The decisions below come from a grilling session with the owner on 2026-11-24, recorded in [ADR 0004](../../../docs/adr/0004-the-store-decides-pro.md) and in `GLOSSARY.md` (**Pro**, **Locked routine**, **Restore purchase**). The Paywall and Pro unlocked screens are drawn on the design canvas (row 5, Progress and Pro): `Paywall`, `PaywallStates` (loading, offline, pending and Restore checking) and `ProUnlocked`. The Increment Pro card is drawn on `Settings` (row 6); its `pro` tweak switches between "Unlock ›" and "Unlocked ✓".

## Problem Statement

Pro can't be bought. `useIsPro()` (`src/routines/routineQueries.ts`) always returns false, the `entitlements` table has never been written, and there is no Paywall. Nobody can pay for the app, and none of the Phase 3 Pro features (features 2 to 8) has a gate to read. A lifter who bought Pro on another phone has no way to get it back.

## Solution

A one-time Pro purchase with no subscription, through the phone's own store, that keeps working offline.

- **Paywall** (`Paywall` on the canvas):
  - "Restore purchase" at the top left and a close button at the top right.
  - "Increment Pro" / "Pay once and keep it forever."
  - The 9-row Free/Pro table.
  - The button **Unlock Pro · [the store's localized price]**, with "One-time payment. No subscription. Works offline." under it.
- **Pro unlocked** (`ProUnlocked`), shown once whenever Pro switches on. It has the "Lifetime access" hero, "Pro unlocked", the list of what's included and **Start using Pro**, which returns the lifter to the screen the Paywall was opened from. It has no "Turn on automatic backups" card until feature 7.
- **Increment Pro card** at the top of Settings, above Units. A free lifter sees "Unlock ›", which opens the Paywall. A Pro lifter sees "Unlocked ✓", which can't be tapped. This card is where a lifter finds Restore purchase after onboarding.
- **The store decides Pro** (ADR 0004). The app asks the phone's store which purchases this lifter owns:
  - on a cold launch;
  - on return to the foreground;
  - after a purchase;
  - after Restore purchase.

  "Owned" turns Pro on, a definite "not owned" turns it off (that is how a refund lands), and no answer leaves the cached value in place. The app never waits for the store before drawing a screen.
- **One `isPro` gate** that every later feature reads (product rule 7).

## User Stories

**Buying**
1. As a free lifter, I want an Increment Pro card at the top of Settings that opens the Paywall, so that I can find Pro without hitting a limit first.
2. As a lifter on the Paywall, I want the Free/Pro table, so that I see what I get before paying.
3. As a lifter, I want the button to show my store's price in my currency ("Unlock Pro · ₱300.00"), so that I know exactly what I'll pay.
4. As a lifter, I want the button disabled with a small spinner while the price loads, so that I never tap a price that isn't real.
5. As a lifter with no connection, I want the button disabled, with "Connect to the internet to buy Pro." in place of the usual line, so that I know why I can't buy right now. The rest of the Paywall still works.
6. As a lifter, I want tapping Unlock Pro to open the store's own payment sheet, so that paying works like every other app.
7. As a lifter who cancels the store's sheet, I want to land back on the Paywall unchanged, with no error, so that cancelling is harmless.
8. As a lifter whose payment fails, I want a short alert saying the store couldn't complete it, so that I know nothing was charged.
9. As a lifter who pays, I want the Pro unlocked screen, so that I know it worked.
10. As a lifter, I want Start using Pro to take me back to where I opened the Paywall, so that I can carry on with what I was doing.

**Paid later (pending)**
11. As a lifter paying by cash or bank transfer (Android), or a child waiting on Ask to Buy (iOS), I want the button to read "Payment pending", disabled, with "Pro unlocks when the store confirms your payment.", so that I don't try to pay twice.
12. As that lifter, I want Pro to switch on by itself once the payment clears, even if the app was closed, and the Pro unlocked screen to show then, so that I don't have to do anything.
13. As that lifter, I want the button to return to normal if the payment is cancelled or never made, so that I can try again.

**Restore purchase**
14. As a lifter on a new phone, I want Restore purchase on the Paywall, so that I get Pro back without paying again.
15. As a lifter, I want the link to read "Checking…" and be disabled while it asks the store, so that I know something is happening.
16. As a lifter whose purchase is found, I want the Pro unlocked screen.
17. As a lifter with no purchase on this store account, I want the alert "No purchase found" / "Make sure you're signed in with the Apple ID you bought Pro with." (on Android, "…the Google account…"), so that I know what to check.
18. As a lifter with no connection, I want the alert "Couldn't reach the App Store" (on Android, "Google Play") / "Check your connection and try again."
19. As a lifter whose found purchase is still pending, I want the Payment pending state.

**Offline and refunds**
20. As a Pro lifter, I want Pro to work in airplane mode, so that the gym basement doesn't lock my features.
21. As a Pro lifter, I want every screen to draw at once at launch from the last known Pro state, never waiting on the store.
22. As a lifter whose purchase was refunded, I want Pro to switch off at the next launch or return to the app after my phone's store learns of it. Everything I made stays. What a refunded lifter sees is set out under "Free again" below; this feature only switches the gate off.
23. As a Pro lifter, I want the Settings card to read "Unlocked ✓", so that I can see my Pro state.

**Free again (later features follow these rules)**
24. As a refunded lifter, I keep all my data. Only Pro actions lock: routines past my 2 oldest become Locked routines (feature 2), custom exercises can't be created or edited (feature 3), charts go back to the preview (feature 4), and backups, export and the plate calculator lock (features 5 to 8).

## Implementation Decisions

- **Library: expo-iap**, installed with `npx expo install expo-iap`. Add its config plugin to `app.json`, plus `expo-build-properties` if its docs still ask for a Kotlin version. It needs a development build, not Expo Go. Check the expo-iap docs for the installed version before writing any call. The API names below come from its docs at the time of grilling (`initConnection`, `fetchProducts`, `requestPurchase`, `purchaseUpdatedListener`, `purchaseErrorListener`, `finishTransaction`, `getAvailablePurchases`) and may have moved. Its hosted check (`verifyPurchaseWithProvider` / IAPKit) is **not** used, because it is a network service (product rule 6).
- **Product:** one non-consumable, `pro_lifetime`, with the same ID on both stores, defined in one constant in the Pro module.
- **Pro module, `src/pro/`** (new). It is the only place that knows about the store and the only place an `isPro` check comes from:
  - **Entitlement decision (pure, no I/O).** Given the cached row and the store's answer, return the new row and whether Pro just switched on.
    - The store's answer is one of: owned (product ID, proof, pending or purchased), not owned, or no answer.
    - Owned and purchased → `is_pro = 1`, with `product_id`, `proof` (the iOS signed transaction, or the Android purchase token) and `verified_at = now`.
    - Owned but pending → the row is unchanged, and the module reports pending.
    - Not owned → `is_pro = 0`, with `proof` and `product_id` cleared and `verified_at = now`.
    - No answer → unchanged.
    - "Switched on" is true only for a change from 0 to 1.
  - **Paywall state (pure).** Given the product fetch (loading, loaded with a localized price string, or failed), whether a purchase is pending and whether a purchase is in flight, return the button label, whether it is enabled, whether it shows a spinner, and the line under it. Return the Restore result text the same way, from the restore outcome and the platform.
  - **Store adapter (thin I/O).** It wraps expo-iap behind four calls:
    - connect;
    - fetch the Pro product;
    - buy;
    - ask what is owned.

    It also acknowledges any purchased but unacknowledged Pro purchase. On Android, acknowledging is `finishTransaction` with `isConsumable: false`, called right after a purchase and on every check, so Google never refunds a purchase after 3 days. Every call is guarded and turns any error into "no answer". Two checks never run at once (the same serialising idea as `refreshReminders`).
  - **Pro store (Zustand, vanilla, like `src/settings/unitStore.ts`).** `isPro`, `pending`, and a dev `source` (`store` | `pro` | `free`). `load()` reads the `entitlements` row once the database is ready, before any screen renders, next to `loadUnitOnce()` in `src/app/_layout.tsx`. `refresh()` asks the store, writes the row through the entitlement decision, and updates state. The single-row table is written with an upsert on id 1, since no row exists yet. **One migration (0012)** adds `unlock_screen_owed` (boolean, not null, default false) to `entitlements`. It is set when Pro switches on from the store while the live workout screen is open, and cleared once Pro unlocked has shown. The dev source never sets it.
  - **`useIsPro()`** moves here from `src/routines/routineQueries.ts`, and its callers (`src/app/(tabs)/routines.tsx`, `src/app/routines/new.tsx`) import it from `@/pro`. With the real gate wired, a Pro lifter's 2-routine limit lifts at once, through `canCreateRoutine`.
- **When to check the store:** on a cold launch once the database is ready, and each time the app returns to the foreground (the same `AppState` effect in `src/app/_layout.tsx` that calls `refreshReminders`). Also after a purchase update and after Restore purchase. The `purchaseUpdatedListener` is set up once at the root, so a pending purchase that completes while the app is open is caught too.
- **Pro unlocked shows once** whenever the effective `isPro` (after the dev source) switches from false to true, whatever caused it (a purchase, a pending purchase completing, a Restore, or a launch on a new phone). If the Paywall is open, Pro unlocked replaces it. Otherwise the root pushes it.
  - **Never over a live workout** (owner decision 2026-11-24). This covers a pending payment clearing mid-set and a crash resume at launch. While the live workout screen is open, Pro switches on quietly and `unlock_screen_owed` is set. Pro unlocked shows once the workout is finished (after the summary) or discarded. If the app is killed first, it shows at the next launch, unless that launch resumes a workout, in which case it waits for that workout to end. **Start using Pro** dismisses Pro unlocked and the Paywall together and returns to the screen underneath. Check the SDK 58 Expo Router docs for modal presentation and dismissing several screens.
- **Routes:** `src/app/paywall.tsx` and `src/app/pro-unlocked.tsx`, both presented modally. Their components live in `src/pro/`. Every Paywall entry point (here only the Settings card; features 2 to 8 add theirs) opens it with `router.push("/paywall")`.
- **Paywall states** (button / line under it):
  - Loading: "Unlock Pro", disabled, with a spinner / "One-time payment. No subscription. Works offline."
  - Loaded: "Unlock Pro · {localized price}", enabled / the same line.
  - Store unreachable: "Unlock Pro", disabled / "Connect to the internet to buy Pro." It fetches again when the Paywall reopens or the app returns to the foreground.
  - Pending: "Payment pending", disabled / "Pro unlocks when the store confirms your payment."
  - In flight (the store's sheet is open): disabled with a spinner.
  - A user cancel returns to Loaded with no alert. Any other purchase error shows one native alert, "Purchase didn't go through" / "You weren't charged. Try again in a moment.", and returns to Loaded.
- **Restore purchase:** asks the store what is owned, using the same path as the launch check. The link reads "Checking…" and is disabled while it runs. The outcomes:
  - found → Pro unlocked;
  - pending → the Payment pending state;
  - nothing found → the native alert "No purchase found";
  - no answer → "Couldn't reach the App Store" or "Couldn't reach Google Play".

  The copy is in the user stories. Both alerts have one **OK** button.
- **A Pro lifter never sees the Paywall:** the Settings card isn't tappable, and later entry points check the gate first. If the Paywall is open when Pro switches on, Pro unlocked replaces it.
- **Settings:**
  - `ProCard` in `src/settings/`, first in `src/app/settings.tsx` above `UnitCard`, built from design tokens.
  - A `DeveloperCard` last, rendered only when `__DEV__`, with a three-way segmented control "Pro source: Store / Pro / Free".
  - The dev source overrides `isPro` in memory only, resets to Store on every launch, and never writes `entitlements`. With Free set, `pending` is ignored too.
- **No Locked routine here.** It is built in feature 2 (decided at grilling; the map is updated).
- **Docs in the same change:**
  - `docs/screens.md`: the Paywall, Pro unlocked and Settings rows.
  - `docs/product.md`: the paywall states, Restore purchase in Settings, and refunds.
  - `docs/architecture.md`: Offline one-time purchase (expo-iap and ADR 0004 are already in).
  - `docs/decisions.md`: a Pro purchase entry (the ₱300 price is already recorded).
  - `docs/agents/rules/product.md` rule 6: already reworded.
  - `.scratch/phase-3/map.md`: feature 1 marked built.
- **ADR 0004** records the main trade-off. Nothing else here needs an ADR.

## Testing Decisions

A good test checks behaviour through a module's interface (what Pro state and what text result from a store answer), not how the store library is called.

- **Entitlement decision (Jest, the main seam):**
  - A fresh row (no row, or `is_pro` 0) plus owned and purchased → Pro, with proof and `verified_at` set, and "switched on" true.
  - Already Pro plus owned → still Pro, "switched on" false, and `verified_at` moves forward.
  - Pro plus not owned (a refund) → free, with proof cleared.
  - Pro plus no answer → still Pro, row untouched. Free plus no answer → still free.
  - Free plus owned but pending → free, pending reported, "switched on" false. The same purchase later purchased → Pro, "switched on" true.
  - A hand-edited row (`is_pro` 1, no proof) plus not owned → free.
- **Paywall state:** each state's label, enabled flag, spinner and line, as listed above. Pending beats loaded, and in flight beats everything.
- **Restore text:** each outcome on iOS and Android ("Apple ID" / "Google account", "App Store" / "Google Play").
- **Dev source:** Store passes the stored value through; Pro and Free override it. Nothing is written.
- **When Pro unlocked shows (pure):** given "switched on", whether the live workout screen is open, and the stored owed flag, return show now, owe it, or nothing. Cases:
  - switched on with no workout → show now;
  - switched on during a workout → owe it;
  - workout ends while owed → show now and clear the flag;
  - launch with the flag owed and no workout to resume → show now;
  - launch with the flag owed and a workout resumed → keep owing.
- **Migration 0012:** a database at 0011 migrates with `unlock_screen_owed` false (extend `src/db/migrations.test.ts`).
- **Pro store:** with a fake adapter (no expo-iap in Jest), `load` reads the row, and `refresh` writes it through the decision. Two overlapping `refresh` calls run one after the other.
- **Not unit-tested:** the expo-iap calls, the store's payment sheet, and the layouts (owner check).
- **Owner check on a phone, both stores** (last ticket):
  - Buy in the sandbox / with a license tester, and see Pro unlocked.
  - Airplane mode, then kill and relaunch: still Pro.
  - Restore on a second install.
  - Nothing found with another account.
  - Offline Restore shows the alert.
  - Android pending purchase via a test card that "slowly declines" or "slowly approves".
  - Refund or revoke the test purchase in the console: Pro turns off at the next launch.
  - Edit `is_pro` by hand on a free install: it turns back off at the next launch.
- Prior art: `src/settings/unitStore.test.ts` (a vanilla store over the database), `src/settings/reminderSetting.test.ts`, `src/routines/routineLimit` callers.

## Out of Scope

- The **Locked routine** and the Unlock Pro button on the "2 free routines used" pop-up (feature 2).
- Swapping the Progress "comes with Pro" sheet for the Paywall (feature 4). It stays as it is.
- Every other Pro entry point and feature (features 3 to 8).
- The Welcome back restore in onboarding (Phase 4); only the restore function lands here.
- Checking the signature of the stored proof on the phone (rejected in ADR 0004).
- Any server, receipt-checking service or analytics.
- Changing the Pro price. It is ₱300 for now (`docs/decisions.md`), set in each store console, and the app only shows what the store returns.
- Light/dark theme (still open).

## Further Notes

- **The price is ₱300 for now** (`docs/decisions.md`). The owner sets it when creating `pro_lifetime` in App Store Connect and Play Console (ticket 03, after ticket 02 uploads a first Android build).
- It is **unverified** that expo-iap supports SDK 58 and that its owned-purchase query answers offline (StoreKit 2's current entitlements; Play's cached purchase query). Ticket 04 checks both on a device, plus what the store returns when it is signed out, before tickets 05 to 08 build on them. If expo-iap fails, react-native-iap has the same API, so only the adapter changes.
- iOS testing can use a StoreKit configuration file in Xcode for local runs, as well as App Store sandbox accounts. Android needs the app uploaded to an internal testing track, plus license testers.
