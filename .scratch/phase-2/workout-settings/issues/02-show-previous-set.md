# 02: Show previous set

**What to build:** A Show previous set switch in the Settings Workout card. Off hides the whole Last column in the live workout; the Target banner and prefilled weight and reps stay. On is the default, as today.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] A "Show previous set" switch row under Default rest in the Workout card, on by default, applied at once and kept after closing the app
- [ ] Off hides the Last column's header and cells in the live workout, for weighted exercises (rows are Set, weight, reps, check) and bodyweight exercises (rows are Set, reps, check); the freed width goes to the weight and reps boxes
- [ ] The Target banner and prefilled values are unchanged; the Offer, the workout summary and Today are unchanged
- [ ] Turning it on again shows the column with the previous session's values
- [ ] Jest: the column is absent when off and present when on, for a weighted and a bodyweight exercise (extend the existing Last column tests)
- [ ] Type check, lint and tests pass
