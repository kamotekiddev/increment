# 03: Show every weight in the chosen unit

**What to build:** Replace each hard-coded `"kg"` with the unit from `useUnit()` on every screen that shows a weight.

**Blocked by:** 01

**Status:** built

- [ ] Offer, workout summary, Today preview, Target banner and rest panel "Next up" read the unit
- [ ] A search of `src` finds no `"kg"` passed to `formatWeight` (tests and the gallery demo excepted)
- [ ] Switching the unit in Settings changes these screens with no other change to stored data
- [ ] Type check, lint and tests pass
