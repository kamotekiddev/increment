# 07: Restore purchase

**What to build:** The Paywall's "Restore purchase" link and its four outcomes.

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] A pure restore text function: the outcome (found / pending / nothing found / no answer) and the platform give either a state change or an alert title and body.
  - Nothing found: "No purchase found" / "Make sure you're signed in with the Apple ID you bought Pro with." On Android, "…the Google account…".
  - No answer: "Couldn't reach the App Store" or "Couldn't reach Google Play" / "Check your connection and try again."
  - Jest covers each outcome on both platforms.
- [ ] Tapping the link runs the same `refresh()` path. While it runs the link reads "Checking…" and is disabled.
  - Found: Pro unlocked shows (ticket 06's rule).
  - Pending: the Payment pending state.
  - Nothing found or no answer: one native alert with **OK**.
- [ ] Type check, lint and tests pass.
