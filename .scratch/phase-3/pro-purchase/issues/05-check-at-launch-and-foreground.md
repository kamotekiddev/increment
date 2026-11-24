# 04: Check the store at launch and on return to the app

**What to build:** Wire `refresh()` to the real adapter at the moments ADR 0004 sets, so refunds and hand edits are undone and pending purchases complete by themselves.

**Blocked by:** 04

**Status:** built

- [x] `refresh()` runs once the database is ready and each time the app returns to the foreground, in the existing `AppState` effect in `src/app/_layout.tsx`. Screens never wait on it: they draw from the loaded row first.
- [x] The purchase update and error listeners are set up once at the root. A purchase update triggers `refresh()`, so a pending purchase that completes while the app is open turns Pro on.
- [x] A definite "not owned" turns Pro off; no answer changes nothing (covered by ticket 01's tests).
- [x] Type check, lint and tests pass.

## Comments

- 2026-11-24, agent: `startProChecks(store, adapter, appState)` in `src/pro/proChecks.ts` (tested with the fake adapter and a fake AppState) refreshes on start, on `active` and on each purchase update, and is started from the existing reminders effect in `_layout.tsx` via `startProStoreChecks()`; there is no separate error listener, since the adapter has none and ticket 04 found `requestPurchase` rejects on every failure, so errors already reach `buy()`.
