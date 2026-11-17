# 01: Today state logic

**What to build:** The pure Today-state builder from the spec, with Jest tests: strip marks (today, planned, done) Sunday first, cards in Routines-tab order, Done, in progress, rest day with next planned day, no days set, no Routines, and the start-date rule. Nothing visible on a phone yet.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Cards: one per Routine planned today, in order; a finished Workout started today makes it Done; discarded does not
- [ ] In-progress Routine is marked, other cards unchanged
- [ ] Strip: today, planned dot, done check (any finished Workout that day, planned or not); no missed state
- [ ] Rest day names the next planned Routine and day, wrapping to next week; no days set and no Routines are separate states
- [ ] A Workout started 11:50 pm counts for its start day
- [ ] Plain inputs only, no database or React; type check, lint and tests pass
