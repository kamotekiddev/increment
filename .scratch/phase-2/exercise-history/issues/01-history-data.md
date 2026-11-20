# 01: Exercise history rows

**What to build:** The pure row builder and the cross-routine query behind Exercise history. Nothing on screen yet.

**Blocked by:** None (can start immediately)

**Status:** wontfix (superseded by Workout history, 2026-11-20)

- [x] Pure: date label with the year only when not this year; chip text (`62.5 × 8`, `137.79 × 8` in lb, `9 reps` at weight 0, `10 × 8` for added weight on a bodyweight exercise); row builder (done working sets in `idx` order, Deload flag, routine name)
- [x] Query: finished workouts of one exercise across routines, newest `started_at` first, the routine's current name, rows with no done working set dropped
- [x] Jest for each pure seam and a database test (two routines, in-progress excluded, rename, no routine, only warm-ups, Deload, same-day order)
- [x] Type check, lint and tests pass
