# 07: Phone check and docs

**What to build:** The feature is checked end to end on a phone and the docs say what was built.

**Blocked by:** 02, 03, 04, 05, 06

**Status:** ready-for-human

- [ ] Walk-through on a phone: free with 2 routines (pop-up, buy, back), refund state with 4 routines (card, dimmed rows, locked screen, delete unlocks the next), Today and Reminders, a refund during a workout.
- [x] `docs/decisions.md` gets a "Routine limit upgrade" entry (owner decisions 2026-11-24, link to the spec). `docs/product.md`'s refund line now says the Locked routine is built. `docs/screens.md` is correct. `.scratch/phase-3/map.md` marks feature 2 built.
- [x] Type check, lint and tests pass. `graphify update .` is run.
