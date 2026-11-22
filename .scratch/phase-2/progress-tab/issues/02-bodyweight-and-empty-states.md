# 02: Bodyweight exercise and empty states

**What to build:** The other two boards. An exercise with no weight shows its top set in reps (`10 reps`, `up 1 rep since 29 Oct`), Most reps in a set and Most reps in a workout, as on `Progress bodyweight exercise`. An exercise with no finished workout shows the "Your first record is one workout away" card and the Records card with "– – –" rows, as on `Progress no workout yet`. A lifter with no routines and no finished workout sees the title row, the History pill and "No workouts yet." An Estimated 1-rep max that does not exist (every counted set above 12 reps) reads "– – –". See `../spec.md`.

**Blocked by:** 01

**Status:** built

- [x] Bodyweight hero, line and Records rows match the board
- [x] Empty card uses the full exercise name
- [x] No routines and no workouts shows "No workouts yet."
- [x] A missing 1-rep max shows "– – –", not 0
- [x] Tests at the Progress read module cover bodyweight and no-workout cases
- [x] Type check, lint and tests pass
