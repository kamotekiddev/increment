# 01: Default rest

**What to build:** A Workout card on the Settings screen, between the Units card and the Data card, with a Default rest row: an inline − / + stepper showing m:ss. An exercise added to a Routine after the lifter changes it starts at that rest. This ticket also lays the storage for all three Workout settings, so tickets 02 and 03 add only their row and wiring.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] One Drizzle migration adds three not-null columns to the `user_settings` row: Default rest in seconds (default 90), Show previous set (default on) and Keep screen awake (default on). Existing rows get the defaults
- [ ] One hook per setting (like `useUnit()` and `useJumps()`) returns the value and a setter; screens re-render on change; no screen reads the table directly
- [ ] The Workout card shows the Default rest row only (02 and 03 add theirs). It sits under the Units card and above the Data card, and follows the design tokens
- [ ] − / + step 15 s and stop at 15 s and 10 min, reusing the existing rest clamp and rest label; a stored out-of-range value is repaired on read. The change applies at once and survives closing the app
- [ ] An exercise added to a Routine starts at the Default rest; its sets and rep range keep their defaults. Exercises already in Routines, and their stored rest, never change. The Rest length can still be changed per exercise in Exercise setup
- [ ] The 90 s fallback for a workout whose Routine exercise was deleted is untouched
- [ ] Jest: a fresh database reads 90 s, on, on; a write reads back and touches no other column (unit and Jumps unchanged); the stepper clamp at both ends; a new exercise setup takes the Default rest; a database test that changing the setting leaves an existing exercise's stored rest unchanged
- [ ] Type check, lint and tests pass
