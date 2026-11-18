# 06: Design states

**What to build:** Align the Today header, week strip, empty state and rest-day state with the owner's design (decisions 2026-11-17). Date line above the title; strip cells with day name over date number (today filled, outlined on a rest day, finished days tinted, a dot for planned and not done); a "No routine yet" card with a Create a routine button; a rest day with the title "Rest day", a "Recover today" banner (planned vs done this week), a "Next: Push" row with the weekday, and a card of the next Routine's first 3 exercises with their Targets from the engine. Not built: settings gear, ready-made plans, empty workout, Train anyway, week number.

**Blocked by:** 05

**Status:** built

- [x] `buildToday` rest state carries `routineId`, the full weekday and the week totals; strip days carry `dayNumber` (Jest)
- [x] Pure, tested helpers: date line, title, banner text, strip labels, Next-card rows and Target text
- [x] Next-card Targets use the engine through the same history path as Start (`pastExercises`, `toHistory`, `nextTarget`); nothing is written
- [x] Design tokens only (new `size` entries, `borderWidth`, Button `icon`); no eslint-disable
- [x] Type check, lint and tests pass
- [ ] Looks right on a device (not run on a device yet; see ticket 04)
