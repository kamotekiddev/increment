# 02: Start a workout and tick off sets

**What to build:** A Start workout button on the routine's Edit screen (disabled when the routine has no exercises). Starting creates the Workout from the routine as it is then, with the Target for each exercise from the engine (history read by routine only, fixed 2.5 kg Jump in one constant, kg only). The live workout shows the Target banner and prefilled rows, and marking a set done saves at once.

**Blocked by:** 01

**Status:** built; checked by tsc, lint and Jest only

- [ ] Start creates the workout in progress, its Workout exercises (with the Target shown, empty on a first workout) and its set rows
- [ ] Rows are prefilled per the spec; the first-time note appears when there is no Target
- [x] A set with a blank weight cannot be marked done
- [ ] Marking a set done writes to the database straight away
- [ ] Target history for an exercise comes only from workouts of the same routine (ADR 0002)
- [x] The Jump is one named constant
- [ ] Type check, lint and tests pass; behaviour checked in Expo Go
