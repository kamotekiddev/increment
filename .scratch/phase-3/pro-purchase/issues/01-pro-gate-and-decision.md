# 01: Pro gate, entitlement decision and dev source

**What to build:** The `src/pro/` module with no native code. It has the pure entitlement decision, the Pro store over the `entitlements` row, the one `useIsPro()` every feature reads, and the dev source override. A fake adapter stands in for the store until ticket 04.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A pure entitlement decision takes the cached row, the store's answer (owned with product ID, proof and pending/purchased; not owned; no answer) and `now`. It returns the new row, `pending`, and whether Pro just switched on (0 → 1 only). The rules are in the spec.
- [ ] A `pro_lifetime` product ID constant.
- [ ] A vanilla Zustand Pro store (like `src/settings/unitStore.ts`) with `isPro`, `pending` and a dev `source` (`store` | `pro` | `free`).
  - `load()` reads the row.
  - `refresh()` asks an adapter interface, writes the row (upsert on id 1) through the decision, and runs one call at a time.
  - It exposes a "switched on" event for ticket 06, fired when the **effective** `isPro` (after the dev source) goes from false to true. A purchase and a switch of the dev source to Pro behave alike.
- [ ] `loadProOnce()` is called in `src/app/_layout.tsx` next to `loadUnitOnce()`. A read error shows the existing "Could not open your data" screen.
- [ ] `useIsPro()` moves from `src/routines/routineQueries.ts` to `@/pro`, and its callers are updated. It applies the dev source: Pro or Free override in memory; Store passes the stored value through.
- [ ] Jest:
  - every decision case in the spec's Testing Decisions;
  - the dev source;
  - the store with a fake adapter: load, refresh writes, and overlapping refreshes serialise.
- [ ] Type check, lint and tests pass.
