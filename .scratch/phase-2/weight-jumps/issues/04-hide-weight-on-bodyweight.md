# 04: No weight box on bodyweight exercises

**What to build:** The live workout hides the weight box on `bodyweight` exercises, so a lifter is never asked for a weight that is not used.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] The set row and column header drop the weight field and the unit label for a `bodyweight` exercise; Set, Last, Reps and the check keep their places
- [ ] A bodyweight set saves weight 0 and can be marked done with reps only
- [ ] The Target banner, Last column, Offer, summary and Today preview read sensibly with no weight (for example "Target: 9 reps")
- [ ] Jest for the done rule and the text helpers on a bodyweight exercise
- [ ] Type check, lint and tests pass
