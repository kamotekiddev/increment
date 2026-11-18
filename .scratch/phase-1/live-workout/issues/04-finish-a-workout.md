# 04: Finish a workout

**What to build:** Finish confirms when sets are unchecked and then drops them. An exercise with no done sets is left out of the saved workout and is not a Miss, and the prompt names it. Finish with no sets done offers Discard instead. Finishing saves the workout and returns to where it started.

**Blocked by:** 02, 03

**Status:** built; checked by tsc, lint and Jest only

- [ ] The prompt names the number of unchecked sets and any skipped exercise
- [ ] Confirming drops unchecked sets, removes skipped exercises, sets the finish time and clears in-progress
- [ ] With no done sets at all, Finish offers Discard and saves nothing
- [ ] The Target shown is saved with each Workout exercise; `progress_accepted` stays false
- [x] Type check, lint and tests pass
