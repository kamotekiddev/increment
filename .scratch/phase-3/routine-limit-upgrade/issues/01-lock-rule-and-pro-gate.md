# 01: Lock rule and Pro gate

**What to build:** A single pure rule decides which routines are Locked routines, and the code stops using "locked" for the workout-in-progress block. Nothing visible changes yet.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A pure function in the routine-limit module returns the locked routines from the routines' creation order (lowest `id` first stays open, the 2 oldest) and `isPro`. Nothing is stored. It sits beside `FREE_ROUTINE_LIMIT` (product rule 7).
- [ ] Jest covers: 3 routines free gives 1 locked; reordering (`position`) changes nothing; deleting an older routine unlocks the next; Pro gives none; fewer than 3 gives none.
- [ ] `isRoutineLocked` (blocked by a Workout in progress) is renamed `isBlockedByWorkout` everywhere, with its tests and comments, so "locked" means only the Pro lock (`GLOSSARY.md`).
- [ ] Type check, lint and tests pass.
