# 04: Keep reminders in step with Workouts and Routines

**What to build:** Scheduled reminders stay correct when the lifter trains or changes a Routine. Starting a Workout cancels today's reminder, a discard can bring it back, and a change to Routine days, names or exercises changes the reminders.

**Blocked by:** 02

**Status:** built

- [x] Start workout (from Today, Edit routine, or replacing one in progress) calls `refreshReminders()` after the Workout is saved, so today's reminder is gone
- [x] Discard workout calls it after the delete, so today's reminder comes back if its time has not passed
- [x] Routine create, delete, rename and days change, and exercises added to or removed from a Routine, each call it after the write
- [x] Finish workout does not need to call it (Start already cancelled today)
- [x] The refresh is fire-and-forget: a failure never blocks or breaks Start, Discard or a Routine save
- [x] Jest: wherever a call site is behind a pure or database seam, a test that the planner input (the started-today flag, the Routine days and names, the exercise counts) reflects the change. The OS calls are not unit-tested
- [x] Type check, lint and tests pass
