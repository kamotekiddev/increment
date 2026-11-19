# 02: Weight jumps screen

**What to build:** The Weight jumps screen and its entry row in Settings, as drawn in `WeightJump.dc.html` without the plates section.

**Blocked by:** 01

**Status:** built

- [x] A "Smallest weight jump" row in the Settings Units card shows the Barbell Jump in the lifter's unit and opens `src/app/weight-jumps.tsx`
- [x] Five rows with an equipment icon, a short example line and − / +: Barbell, Dumbbell, Machine, Cable, Bodyweight added weight ("Weighted pull-ups, dips")
- [x] Values show in the lifter's unit, and each unit keeps its own Jumps; − / + move one rung along that unit's ladder of real plate steps (kg 0.5, 1, 1.25, 2, 2.5, 5, 10; lb 1.25, 2.5, 5, 10, 15, 20; an off-ladder value moves to the next rung up or down) and never go to 0 (the ladders and bounds are pure and tested; owner decision 2026-11-19)
- [x] The note under the card says each unit keeps its own jumps
- [x] A change saves at once and survives closing the app
- [x] The intro note reads as in the mockup, without the plates sentence
- [x] Built from the design tokens and existing base components; touch targets at least 44 pt
- [x] Type check, lint and tests pass
