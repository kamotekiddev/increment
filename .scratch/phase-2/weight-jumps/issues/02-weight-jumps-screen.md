# 02: Weight jumps screen

**What to build:** The Weight jumps screen and its entry row in Settings, as drawn in `WeightJump.dc.html` without the plates section.

**Blocked by:** 01

**Status:** built

- [x] A "Smallest weight jump" row in the Settings Units card shows the Barbell Jump in the lifter's unit and opens `src/app/weight-jumps.tsx`
- [x] Five rows with an equipment icon, a short example line and − / +: Barbell, Dumbbell, Machine, Cable, Bodyweight added weight ("Weighted pull-ups, dips")
- [x] Values show in the lifter's unit; − / + move along one ladder in kg and lb (0.5, 1, 1.25, 1.5, 2, 2.5, 3, then every 0.5 up to 25 kg or 50 lb; an off-ladder value moves to the next rung) and never go to 0 (the ladder and bounds are pure and tested; owner decision 2026-11-19)
- [x] A change saves at once and survives closing the app
- [x] The intro note reads as in the mockup, without the plates sentence
- [x] Built from the design tokens and existing base components; touch targets at least 44 pt
- [x] Type check, lint and tests pass
