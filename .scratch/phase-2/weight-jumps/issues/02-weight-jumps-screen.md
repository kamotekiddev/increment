# 02: Weight jumps screen

**What to build:** The Weight jumps screen and its entry row in Settings, as drawn in `WeightJump.dc.html` without the plates section.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] A "Smallest weight jump" row in the Settings Units card shows the Barbell Jump in the lifter's unit and opens `src/app/weight-jumps.tsx`
- [ ] Five rows with an equipment icon, a short example line and − / +: Barbell, Dumbbell, Machine, Cable, Bodyweight added weight ("Weighted pull-ups, dips")
- [ ] Values show in the lifter's unit; − / + step by a fixed amount per unit and never go to 0 (the step sizes and bounds are pure and tested)
- [ ] A change saves at once and survives closing the app
- [ ] The intro note reads as in the mockup, without the plates sentence
- [ ] Built from the design tokens and existing base components; touch targets at least 44 pt
- [ ] Type check, lint and tests pass
