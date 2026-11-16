# 02: Routines list, create and the limit pop-up

**What to build:** The Routines tab lists routines (name, days, exercise count) in creation order with the free counter and an empty state. New routine takes a name and days and saves on Create, then opens Edit routine. A third free routine shows the limit pop-up with no upgrade button.

**Blocked by:** 01

**Status:** built; checked by tsc, lint and Jest only

- [ ] List rows read like "Mon · Thu · 5 exercises", "No days · No exercises yet"
- [ ] Counter reads "1 of 2 routines"; empty state has Create routine
- [ ] Create validates the name with `validateRoutineName` and shows its message
- [ ] Days optional; two routines may share a day
- [ ] The limit pop-up comes from `canCreateRoutine` only
- [ ] Works offline; tokens used; rows at least 44 pt
