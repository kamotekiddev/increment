# 06: Delete a custom exercise

**What to build:** A lifter can delete a custom exercise, is told exactly what will be lost, and its history goes with it.

**Blocked by:** 01, 02, 05

**Status:** ready-for-agent

- [ ] Delete exercise sits at the bottom of Edit, and opens the sheet from the updated canvas: it names the routines the exercise is in (or says none) and says its history is deleted for good and can't be recovered.
- [ ] Confirming deletes the exercise, removes it from every routine, and deletes its Workout exercises, sets, Records and Streaks ([ADR 0005](../../../../docs/adr/0005-deleting-a-custom-exercise-deletes-its-history.md)). Routines keep their other exercises in order.
- [ ] A finished workout left with no exercises is deleted too, in the same transaction. A workout that keeps other exercises stays, with its totals worked out again.
- [ ] While the exercise is in the Workout in progress, Delete is disabled with "{Name} is in your workout in progress. Finish or discard it first."
- [ ] A free lifter can delete (no Paywall).
- [ ] Today, Reminders, the routine list, Workout history, Progress and the pickers are current afterwards, with no restart.
- [ ] Tests: the cascade, the empty-workout cleanup, the in-progress block, and a name freed for reuse.
- [ ] Type check, lint and tests pass.
