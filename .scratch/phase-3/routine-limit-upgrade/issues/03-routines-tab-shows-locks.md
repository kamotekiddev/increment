# 03: Routines tab shows locks

**What to build:** After a refund the Routines tab shows which routines are locked and how to get them back.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] When any routine is locked, the counter card reads "**N routines locked.** Unlock Pro to use them again." with a lock icon and a chevron, no meter, and a tap opens the Paywall. With nothing locked it is the free counter as today. With Pro there is no card, only the plain count.
- [ ] A locked row is dimmed to about 50% (title, summary, days line kept), with a lock icon and the grey Pro tag on the title row at full strength. It keeps its reordered position. Tapping it opens the locked routine (ticket 04).
- [ ] Matches the `RoutinesLocked` canvas board.
- [ ] Checked on a phone with the dev Pro source switch on Free and 3 or more routines.
- [ ] Type check, lint and tests pass.
