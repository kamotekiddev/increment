# 05: Edit and remove an exercise

**What to build:** Tapping an exercise in Edit routine opens the same setup sheet with its saved values and a Save button; changes apply to this routine only. The sheet has Remove from routine, which asks first ("Remove Bench Press from Push? Your logged workouts keep it."), then removes the exercise and renumbers positions.

**Blocked by:** 04

**Status:** built; checked by tsc, lint and Jest only

- [ ] Editing one routine's exercise does not change the same exercise in another routine
- [ ] Remove asks first, renumbers positions, and leaves logged workouts alone
