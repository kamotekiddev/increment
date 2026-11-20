# 02: History tab and screen

**What to build:** The How to / History switch on Exercise detail and the Exercise history screen with its empty state.

**Blocked by:** 01

**Status:** wontfix (superseded by Workout history, 2026-11-20)

- [x] `exercise/[id].tsx` becomes `exercise/[id]/index.tsx` with the tab switch; `history.tsx` is the new screen; the switch uses `router.replace`, Back goes to the Library
- [x] One `FlatList`: header (back, title, tabs), session rows (date, routine, Deload pill, chips), "No workouts yet" card when empty
- [x] Reloads on focus; weights follow the unit
- [x] Design tokens and base components only; no hex values
- [x] Type check, lint and tests pass
