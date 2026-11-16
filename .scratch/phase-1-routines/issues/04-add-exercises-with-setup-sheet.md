# 04: Add exercises with the setup sheet

**What to build:** The Library's reusable list becomes the picker, with "open setup sheet" as the tap action and an "Added" state for exercises already in the routine. The sheet has sets, reps and rest steppers prefilled 3 / 8–12 / 90 s, a read-only progression row with a Pro badge, and Add to routine. After Add the sheet closes and the picker stays open.

**Blocked by:** 01, 03

**Status:** ready-for-agent

- [ ] Added rows are disabled; the same exercise cannot be added twice
- [ ] Steppers respect the spec limits
- [ ] The stored rule is `defaultRule(loadType)`; the row text comes from `describeRule`
- [ ] New exercises go to the end with the next position
- [ ] Search and chips stay between taps
