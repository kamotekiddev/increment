# 03: Check and docs

**What to build:** The whole Workout history flow checked on a device, and the docs brought in line with what was built. See `../spec.md`.

**Blocked by:** 01 (History list), 02 (Past workout)

**Status:** ready-for-human

- [ ] Device check: Progress → History → a row → Past workout → Back → Back; switch Unit in Settings and return (weights follow); finish a workout and return (it appears at the top); empty state on a fresh install; a workout in progress is not listed
- [x] `docs/screens.md`: Progress row mentions the History pill and that the body arrives with feature 6; Workout history and Past workout rows match what was built
- [x] `docs/product.md` history line still true (record tags arrive with feature 5)
- [x] `.scratch/phase-2/map.md`: feature 4 marked built
- [x] `graphify update .` run
- [x] `npx tsc --noEmit`, `npx expo lint` and the Jest suite pass

**Docs done here:** `docs/screens.md` rows for Progress, Workout history and Past workout now describe the build. In `docs/product.md` the history line moved from Exercise library to Progress, now says it is reached from the History button and shows each exercise's Target, and says record tags arrive with Records. In `.scratch/phase-2/map.md` feature 4 is marked built. The spec and map now say Past workout's exercises are rows with dividers inside one white card, as in `PastWorkout.dc.html`, with the Deload pill at the right end of the name row.

**Needs owner device check** (not run: an agent cannot drive a phone):
- Progress → History pill → a row → Past workout → Back → Back, landing on History and then Progress
- Layout against `Progress.dc.html` (title row and pill only), `WorkoutHistory.dc.html`, `WorkoutHistoryEmpty.dc.html` and `PastWorkout.dc.html`, including the Deload pill at the right end of a name row
- Switch Unit in Settings and return to History and Past workout: Targets and chips follow (62.5 kg reads `137.79` in lb, and `62.5` again in kg)
- Finish a workout and open History: it is at the top
- Fresh install: the "No workouts yet" card
- A workout in progress is not listed
