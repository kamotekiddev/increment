# 02: Cascade migration (prefactor)

**What to build:** Deleting an exercise row removes everything that belongs to it, so a later delete screen can rely on the database. No screen changes.

**Blocked by:** None (can start immediately)

**Status:** built

- [x] The references from routine exercises, workout exercises and sets to an exercise cascade on delete ([ADR 0005](../../../../docs/adr/0005-deleting-a-custom-exercise-deletes-its-history.md)), with a migration that keeps all existing rows.
- [x] A test: deleting an exercise removes its routine rows, Workout exercises and sets, and leaves every other exercise, routine and workout alone.
- [x] The migration test and the seed tests still pass, and library exercises are unchanged.
- [x] `docs/architecture.md` data model line for these tables says they cascade.
- [x] Type check, lint and tests pass.
