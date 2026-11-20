# 02: Weight jumps screen

**What to build:** The Weight jumps screen and its entry row in Settings, as drawn in `WeightJump.dc.html` without the plates section.

**Blocked by:** 01

**Status:** built

- [x] A "Weight jumps" row in the Settings Units card, with no value shown, opens `src/app/weight-jumps.tsx`
- [x] Five rows with an equipment icon, a short example line and − / +: Barbell, Dumbbell, Machine, Cable, Bodyweight added weight ("Weighted pull-ups, dips")
- [x] Values show in the lifter's unit, as the nearest rung of that unit's ladder of real plate steps (kg 0.5, 1, 1.25, 2, 2.5, 5, 10; lb 1.25, 2.5, 5, 10, 15, 20), so a 5 kg Jump shows as 10 lb; − / + move one rung from the shown value, save it in kg, and never go to 0 (the ladders and bounds are pure and tested; owner decision 2026-11-19)
- [x] The note under the card says that in the other unit each jump shows as the nearest plate step
- [x] A change saves at once and survives closing the app
- [x] The intro note reads as in the mockup, without the plates sentence
- [x] Built from the design tokens and existing base components; touch targets at least 44 pt
- [x] Type check, lint and tests pass
