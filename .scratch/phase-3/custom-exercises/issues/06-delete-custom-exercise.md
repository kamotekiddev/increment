# 06: Delete a custom exercise

**What to build:** A lifter can delete a custom exercise, is told exactly what will be lost, and its history goes with it.

**Blocked by:** 01, 02, 05

**Status:** built

- [x] Delete exercise sits at the bottom of Edit, and opens the sheet from the updated canvas: it names the routines the exercise is in (or says none) and says its history is deleted for good and can't be recovered.
- [x] Confirming deletes the exercise, removes it from every routine, and deletes its Workout exercises, sets, Records and Streaks ([ADR 0005](../../../../docs/adr/0005-deleting-a-custom-exercise-deletes-its-history.md)). Routines keep their other exercises in order.
- [x] A finished workout left with no exercises is deleted too, in the same transaction. A workout that keeps other exercises stays, with its totals worked out again.
- [x] While the exercise is in the Workout in progress, Delete is disabled with "{Name} is in your workout in progress. Finish or discard it first."
- [x] A free lifter can delete (no Paywall).
- [x] Today, Reminders, the routine list, Workout history, Progress and the pickers are current afterwards, with no restart.
- [x] Tests: the cascade, the empty-workout cleanup, the in-progress block, and a name freed for reuse.
- [x] Type check, lint and tests pass.

Built in `src/library/deleteCustomExercise.ts` (one transaction: delete, renumber the routines' remaining exercises, delete the finished workouts it was in that are now empty), `deleteExerciseText.ts` and `DeleteExerciseSheet.tsx` (reuses `DestructiveSheet`, now with a warning box and a disabled red button). After a delete the screen leaves Edit and Exercise detail. A routine left with no exercises stays. Phone check pending.
