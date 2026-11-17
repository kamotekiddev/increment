# 01: Rest timer rules

**What to build:** The pure rest-timer rules from the spec, with Jest tests. Nothing visible on a phone yet.

**Blocked by:** None (can start immediately)

**Status:** built

- [x] Marking a set done starts a rest from that Routine exercise's Rest length, or replaces a running one
- [x] No rest starts when no open set remains anywhere in the Workout, including when the last exercise is finished first
- [x] Unmarking the set that started the timer cancels it; unmarking any other set leaves it alone
- [x] "Next up" gives the next open set (`Set 3 · 62.5 kg × 8`, reps only for a blank weight or a bodyweight exercise), or the next exercise with an open set when this one is finished
- [x] At zero: hide when the exercise still has an open set; advance to the next exercise with an open set (wrapping) when it is finished and the lifter is still viewing it; buzz only when the lifter is viewing another exercise
- [x] ±15 seconds change the running rest only, flooring at zero, and a rest reduced to zero resolves like a countdown reaching zero
- [x] Remaining time and ring fraction come from an end time and a clock value; a rest that ended while away resolves without a buzz
- [x] Plain inputs only, no database or React; type check, lint and tests pass
