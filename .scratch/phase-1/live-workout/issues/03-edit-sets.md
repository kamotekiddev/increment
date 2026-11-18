# 03: Edit sets: type, follow rule, Last column

**What to build:** On the live workout, the lifter can type weight and reps in plain number inputs (no −/+ buttons), on a fixed number of sets. Untouched rows below an edit follow it. A read-only Last column shows the same set from the last finished workout of this routine exercise.

**Blocked by:** 02

**Status:** built; checked by tsc, lint and Jest only

- [ ] Typing a weight or reps saves at once
- [ ] There are no − and + buttons; weight and reps are typed (−/+ was built first and removed in a follow-up)
- [ ] Rows follow an edit only if untouched and not done
- [ ] The set count is fixed to the plan: no Add set and no remove control (Add set was built first and is removed in a follow-up)
- [ ] The Last column shows the previous result per set, and "–" when last time had no set in that position
- [x] Type check, lint and tests pass
