# Product constraints

6. **Offline only.** No backend, no account and no network calls. Add no analytics or tracking SDKs without an ADR in `docs/adr/`. Pro must work with no connection. The store's on-device answer decides Pro, and the cached `entitlements` row is used when the store can't answer. Never block on the store ([ADR 0004](../../adr/0004-the-store-decides-pro.md)).
7. **Check Pro limits in one place.** Free allows 3 routines, with no custom exercises or charts. Overload rules are free for everyone, so no rule has a Pro check. Don't scatter `isPro` checks through components.
8. **Don't invent product decisions.** Open items in `docs/decisions.md` (price, library source) get flagged to the user, not guessed.

See `docs/product.md` for the free/Pro split.
