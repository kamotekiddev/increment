# 04: Pro notice for the chart chip and "See all records"

**What to build:** Tapping the blurred chart preview or the "See all records" row opens one shared sheet: "Charts and All records come with Pro, in a later update." with an OK button. No `isPro` check yet (Pro is checked in one place, Phase 3, which swaps the sheet for the Paywall link). See `../spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Both spots open the same sheet and OK closes it
- [ ] The sheet is one component, so Phase 3 replaces it in one place
- [ ] Type check, lint and tests pass
