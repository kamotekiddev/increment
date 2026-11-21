# 01: History list

**What to build:** On the Progress tab, a white History pill sits in the title row and opens History: every finished Workout, newest first, across all Routines, under month headers that carry the year (`November 2026`). Each row reads `Thu, 12 Nov` with the Routine name beside it, and `5 exercises · 48 min` under it, with a chevron. With no finished Workout, History shows the "No workouts yet" card. Rows do not open anything yet (ticket 02). See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Progress tab: title row with the History pill (history icon, "History") on the right, as in `Progress.dc.html`; the muted line "Your records will appear here." below. No "Last 8" dropdown, no body
- [ ] The pill pushes History, a stack screen outside the tab group; Back returns to Progress
- [ ] A history read module (outside the routes folder) exposes *workout history* (unit) → month sections of rows as finished display text; the screen only renders what it returns
- [ ] Only finished Workouts; newest first by start time, so two on one day keep their order; no limit, no paging
- [ ] Month header and row date come from the Workout's stored local date, split by hand (not parsed as UTC); year on the month header only; English month and weekday names
- [ ] Routine label is the Routine's current name; a Workout with no Routine reads `Workout`
- [ ] `1 exercise` / `N exercises`, counting the Workout exercises kept on the Workout
- [ ] Duration is finish minus start floored to minutes (the summary's rule), no cap: `0 min`, `48 min`, `1 h`, `1 h 12 min`
- [ ] Layout follows `WorkoutHistory.dc.html` and the design tokens: back button and "History" title, month titles, each month's rows in one white card with dividers; the empty card follows `WorkoutHistoryEmpty.dc.html` ("No workouts yet", "Finish a workout and it shows up here.", no button)
- [ ] Reloads on focus, so a Workout finished elsewhere shows on return
- [ ] Jest database tests (in-memory database with migrations, like the start-workout test) through *workout history* only: in-progress left out; two Routines; newest first and same-day order; a month and a year boundary (`December 2025` after `January 2026`); weekday and month in the date label; renamed Routine; no-Routine `Workout`; exercise count singular and plural; durations `48 min`, `1 h`, `1 h 12 min`, `3 h 5 min`; no finished Workout returns no sections
- [ ] Type check, lint and tests pass
