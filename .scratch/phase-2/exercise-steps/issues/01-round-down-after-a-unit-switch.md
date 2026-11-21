# 01: Round down after a unit switch

**What to build:** Every weight that came from the other unit lands on the largest multiple of the current step at or below it, instead of the nearest. This covers a Target, accepted Target or baseline set in the other unit, the pre-filled rows at Start, the live rows the lifter has not touched after a Settings switch, and the Last column. A lifter in lb whose 62.5 kg Target came from kg sees 135 lb, not 140 lb. A weight already in the current unit is still never rounded. Judging after a mid-workout switch rounds the Target down the same way, so lifting the shown weight is Clean.

**Blocked by:** None (can start immediately). Needs the set-units branch merged into `main` first.

**Status:** built

- [ ] Rounding a converted weight goes down to the step: 62.5 kg is 135 lb, 24 kg is 50 lb, 100 kg is 220 lb, 60 kg is 130 lb, 135 lb is 60 kg (5 lb and 2.5 kg steps)
- [ ] The engine's snap of a Target set in the other unit rounds down, for every kind of Target (hold, on track, Stay, baseline, accepted); a step up still goes one step above the snapped Target (Stay 135 lb, Go up 140 lb) and a drop or deload still rounds down
- [ ] Pre-fill at Start, untouched live rows after a Settings switch, the live Target banner and the Last column all show the rounded-down weight
- [ ] A set lifted at the shown weight after a mid-workout switch meets the Target: 3 × 135 lb against a 62.5 kg Target is Clean; 130 lb is a Hold
- [ ] A weight already in the current unit is unchanged (61.25 kg stays 61.25 kg); bodyweight 0 stays 0
- [ ] Jest covers each case above; existing tests updated where they expected nearest rounding
- [ ] Type check, lint and tests pass
