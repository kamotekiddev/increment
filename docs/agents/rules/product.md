# Product constraints

6. **Offline only.** No backend, no account and no network calls. Add no analytics or tracking SDKs without an ADR in `docs/adr/`. Pro must work with no connection: use the cached `isPro` value and never block on the store.
7. **Check Pro limits in one place.** Free allows 2 routines, with no custom exercises or charts. Overload rules are free for everyone, so no rule has a Pro check. Don't scatter `isPro` checks through components.
8. **Don't invent product decisions.** Open items in `docs/decisions.md` (price, free routine limit, library source) get flagged to the user, not guessed.

See `docs/product.md` for the free/Pro split.
