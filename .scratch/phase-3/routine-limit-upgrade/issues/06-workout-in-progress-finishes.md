# 06: Workout in progress finishes after a lock

**What to build:** A refund that lands in the middle of a workout never costs the lifter that workout.

**Blocked by:** 01, 04

**Status:** built

- [x] A workout started before the lock can be resumed and finished completely: sets, Finish, Offers, and Go up writing the new Target to the routine. Locked blocks starting and manual editing only.
- [x] The routine shows as locked on the Routines tab once the workout ends or is discarded (or immediately, as long as Resume still works from the in-progress bar).
- [x] Jest covers a refund (isPro true to false) with a workout in progress on a routine past the 2 oldest.
- [x] Type check, lint and tests pass.
