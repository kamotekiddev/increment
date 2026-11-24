# 06: Paywall and Pro unlocked

**What to build:** The two screens from the canvas (`Paywall`, `PaywallStates`, `ProUnlocked`), the purchase flow, and the "show Pro unlocked once" rule.

**Blocked by:** 05

**Status:** ready-for-agent

- [ ] A pure Paywall state function: the product fetch (loading / loaded with a price string / failed), pending and in flight give the button label, enabled flag, spinner and line under it. The states are in the spec. Jest covers each state and the precedence (in flight > pending > loaded).
- [ ] `src/app/paywall.tsx`, presented modally, with the component in `src/pro/`:
  - "Restore purchase" (wired in ticket 07), a close button, title and subtitle;
  - the 9-row Free/Pro table;
  - the button and the line under it.

  It fetches the product on open and on return to the foreground. Design tokens only.
- [ ] Tapping Unlock Pro opens the store's sheet. A user cancel returns quietly. Any other error shows the alert "Purchase didn't go through" / "You weren't charged. Try again in a moment."
- [ ] `src/app/pro-unlocked.tsx`, presented modally: the hero, title, line, the four included rows, and **Start using Pro**. There is no backup card (feature 7 adds it).
- [ ] When the Pro store reports a switch to Pro, Pro unlocked replaces the Paywall if it is open, and otherwise the root pushes it. Start using Pro dismisses both and returns to the screen underneath. Check the SDK 58 Expo Router docs for modals and dismissing several screens.
- [ ] Never over a live workout:
  - Migration 0012 adds `entitlements.unlock_screen_owed` (boolean, not null, default false) through Drizzle.
  - A pure "when to show" function covers the five cases in the spec, with Jest.
  - While the live workout screen is open, a switch to Pro sets the flag instead of showing. Finishing (after the summary) or discarding shows Pro unlocked and clears the flag.
  - A launch with the flag set and no workout to resume shows it.
  - The migrations test covers 0012.
- [ ] Type check, lint and tests pass.
