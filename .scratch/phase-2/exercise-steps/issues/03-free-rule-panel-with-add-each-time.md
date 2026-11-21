# 03: Free rule panel with "Add each time"

**What to build:** On the Exercise setup sheet (adding an exercise to a routine, or editing one), the Progression row no longer shows a Pro badge or the "Set your own rule with Pro" note. Tapping it opens the Overload rule panel, free for everyone. The panel's "Add each time" control offers the current unit's plate steps (kg 0.5, 1, 1.25, 2, 2.5, 5, 10; lb 1.25, 2.5, 5, 10, 15, 20) with the routine exercise's step selected, and saving stores it as that unit's step. A live preview reads the next Target with the chosen step ("Next session: 62.5 kg × 6–8. Hit 8 on every set and it becomes 65 kg."). Targets use the new step from the next Start.

**Blocked by:** 02

**Status:** built

- [ ] The Progression row opens the panel from both adding and editing a routine exercise; no Pro check on this path
- [ ] "Add each time" shows only the current unit's steps, with the saved step (or the 2.5 kg / 5 lb default) selected
- [ ] Saving in kg writes only the kg step; saving in lb writes only the lb step; the other unit's step is untouched
- [ ] The preview shows the next Target and the stepped-up one using the chosen step, in the current unit
- [ ] Setting a curl to 2 kg in kg: the next Start after an Earned step offers 2 kg more; switching to lb shows 5 lb (its own default) and back in kg 2 kg again
- [ ] The panel follows the design canvas (`RoutineRule.dc.html`) without the Pro badge; Jest covers the pure preview and step-choice logic
- [ ] Type check, lint and tests pass
