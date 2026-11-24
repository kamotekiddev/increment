# 07: Restore purchase

**What to build:** The Paywall's "Restore purchase" link and its four outcomes.

**Blocked by:** 06

**Status:** built

- [x] A pure restore text function: the outcome (found / pending / nothing found / no answer) and the platform give either a state change or an alert title and body.
  - Nothing found: "No purchase found" / "Make sure you're signed in with the Apple ID you bought Pro with." On Android, "…the Google account…".
  - No answer: "Couldn't reach the App Store" or "Couldn't reach Google Play" / "Check your connection and try again."
  - Jest covers each outcome on both platforms.
- [x] Tapping the link runs the same `refresh()` path. While it runs the link reads "Checking…" and is disabled.
  - Found: Pro unlocked shows (ticket 06's rule).
  - Pending: the Payment pending state.
  - Nothing found or no answer: one native alert with **OK**.
- [x] Type check, lint and tests pass.

## Comments

- 2026-11-24, agent: `restoreOutcome` / `restoreResult` live in `paywallState.ts`. `refresh()` now resolves with the store answer it acted on (no answer when the store or the database failed), and the link awaits it: it never calls a syncing `restorePurchases`, and found and pending need no code of their own (`onSwitchedOn` / the store's `pending`). On iOS, Ask to Buy never reads as pending in `checkOwned` (ticket 04), so a Restore there says "No purchase found" while the Paywall's own pending flag keeps the button on Payment pending.
