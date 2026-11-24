# 02: Limit pop-up pitches Pro

**What to build:** A free lifter with 2 routines who taps **+** sees a pop-up that pitches Pro and opens the Paywall. After buying, they land back on the Routines tab and **+** works.

**Blocked by:** 01

**Status:** built

- [x] The pop-up matches the `RoutineLimit` canvas board: title "You've used your 2 free routines", body "Get unlimited routines with Pro. One payment, yours forever." (no mention of deleting), the 3-tick benefit card, **See Pro** (opens the Paywall) and **Not now** (closes it).
- [x] Both entry points use it: the Routines tab (+ and the dashed New routine button) and the new-routine guard that re-reads the saved count.
- [x] After a purchase from the pop-up the lifter returns to the Routines tab. No remembered intent. The tab and `+` update from `useIsPro()` as soon as the store answers.
- [ ] Checked on a phone with a development build (the dev Pro source switch can stand in for the store). (to check on phone)
- [x] Type check, lint and tests pass.
