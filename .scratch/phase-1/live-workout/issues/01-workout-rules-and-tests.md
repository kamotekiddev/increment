# 01: Workout rules and tests

**What to build:** The pure functions from the spec, in one module with Jest tests: initial set rows (with and without a Target), the follow rule, the finish check (unchecked sets, skipped exercises, no sets done) and which sets the engine judges. Nothing visible on a phone yet.

**Blocked by:** None (can start immediately)

**Status:** built

- [x] With a Target, every planned row is prefilled with its weight and reps
- [x] With no Target, weight is blank and reps start at the bottom of the Rep range
- [x] An edit changes only later rows that are untouched and not done; edited and done rows never change
- [x] The finish check reports unchecked sets, skipped exercises (zero done sets) and the no-sets-done case
- [x] Only done working sets within the planned count are judged; extra sets are not
- [x] Functions take plain inputs, no database or React; type check, lint and tests pass
