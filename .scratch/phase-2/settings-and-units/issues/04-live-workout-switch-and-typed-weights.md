# 04: Live workout switch and typed weights

**What to build:** The `kg | lb` pill in the live workout header, and weights typed in the unit on screen.

**Blocked by:** 01, 03

**Status:** needs-triage

- [ ] The pill sits beside "Exercise N of M", matching `Workout.dc.html`, and writes the global preference
- [ ] Column header, Last column, prefilled and checked weights all convert on a switch
- [ ] An unedited, unchecked weight keeps its exact kg value across a switch
- [ ] A typed weight is read in the unit on screen, saved as kg through `toKg`, with `entered_unit` set to that unit when the set is checked
- [ ] Jest tests for the keep-exact-kg and read-in-current-unit rules
- [ ] Type check, lint and tests pass
