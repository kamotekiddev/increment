# 06: In-progress bar and routine lock

**What to build:** An "in progress" bar above the tab bar on every tab that reopens the workout. While a workout is in progress, its routine cannot be edited or deleted: Edit screen controls are disabled with "Finish or discard your workout first" and a Resume workout button replaces Start. Other routines stay editable.

**Blocked by:** 02

**Status:** built; checked by tsc, lint and Jest only

- [ ] The bar shows the routine name and elapsed time, and disappears at Finish or Discard
- [ ] The locked routine's name, days, exercises, reorder, add and delete are disabled; other routines are unaffected
- [ ] Creating a new routine is still allowed
- [x] Type check, lint and tests pass
