# 09: Phone check and docs

**What to build:** The owner checks Pro purchase and restore on an iPhone and an Android phone, and the docs are updated. This is gate half one: Pro unlocks offline on both stores.

**Blocked by:** 01, 02, 03, 04, 05, 06, 07, 08

**Status:** ready-for-human

- [ ] Settings → Increment Pro → Paywall shows the store's price. Buy with a test account and see Pro unlocked. Start using Pro returns to Settings, and the card reads "Unlocked ✓". The routine limit no longer stops a 3rd routine.
- [ ] Airplane mode, then kill and relaunch: still Pro.
- [ ] Open the Paywall offline on a free install: the button is disabled with "Connect to the internet to buy Pro."
- [ ] A second install with the same account: Restore purchase → Checking… → Pro unlocked. With another account: "No purchase found". Offline: "Couldn't reach …".
- [ ] Android pending purchase with the slow test card: Payment pending. When it approves, Pro turns on and Pro unlocked shows once. When it declines, the button returns to normal.
- [ ] Android pending purchase approved while a workout is open: nothing interrupts the workout, and Pro unlocked shows after Finish.
- [ ] Refund or revoke the test purchase in the console: Pro turns off at the next launch or foreground once the phone has been online.
- [ ] On a free dev install, set `is_pro` to 1 by hand: it turns off again at the next launch.
- [ ] Docs updated:
  - `docs/screens.md`: the Paywall, Pro unlocked and Settings rows;
  - `docs/product.md`: the paywall states, Restore purchase in Settings, and refunds;
  - `docs/architecture.md`: the Offline one-time purchase section;
  - `docs/decisions.md`: a Pro purchase entry.
- [ ] `.scratch/phase-3/map.md` marks feature 1 built.
