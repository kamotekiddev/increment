# 03: Quick start screen and Get started

**What to build:** **Get started** opens Quick start (`OnbQuick`): "You're all set", the four default rows (Goal Stay fit and healthy, Experience Just starting, Schedule 3 days Mon, Wed, Fri, Equipment Full gym) each tagged Default, a Kilograms / Pounds choice with kilograms preselected, and the two plan rows (Full body A on Mon, Fri; Full body B on Wed). **Start training** calls `finishQuickStart` with the chosen unit and opens Today with the 2 routines on the week strip. The choice is held in screen state only, so killing the app leaves nothing saved and restarts at Welcome. In this feature the Default rows have no chevron and "Answer the questions instead" is hidden (feature 2 turns them on). Docs: `docs/screens.md` Quick start row, `docs/decisions.md` (the hard-coded plan and the three temporary stand-ins). See `../spec.md`.

**Blocked by:** 01, 02

**Status:** ready-for-agent

- [ ] Get started opens Quick start; Start training creates Full body A (Mon, Fri) and B (Wed), saves the unit and opens Today, and Welcome never shows again.
- [ ] Choosing Pounds saves lb; the first workout shows pounds.
- [ ] Leaving or killing the app before Start training saves no routines, no unit and no flag.
- [ ] Quick start matches `OnbQuick` (with the 4-exercise count from the spec) in light and dark, with design tokens only.
- [ ] Docs updated, with the temporary stand-ins listed.
- [ ] `npx tsc --noEmit`, `npx expo lint` and the Jest suite pass.

## Comments
