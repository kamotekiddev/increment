# 01: Records module

**What to build:** A records read module that works out, from logged sets, the "New" record tags of a finished Workout and the current records of an exercise. No screen yet. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** built

- [x] A records read module outside the routes folder exposes *workout record tags* (Workout id) and *exercise records* (exercise id, unit); nothing is stored
- [x] Only done Working sets of finished Workouts count, grouped by the library exercise across all routines; "earlier" is by start time
- [x] Weighted exercise: Heaviest set (highest weight, then more reps), Estimated 1-rep max (Epley, a 1-rep set is its weight, sets above 12 reps ignored for it only) and Most volume (most weight × reps in one Workout)
- [x] Bodyweight exercise: Most reps in a set and Most reps in a workout; logged weight ignored
- [x] The first Workout of an exercise returns no tags; equal is not new, except more reps at the same weight for the Heaviest set
- [x] Sets are compared in kg in memory with a small tolerance; stored sets are never changed
- [x] Jest database tests through the two functions only, covering every case in the spec's Testing Decisions
- [x] Type check, lint and tests pass

**Not verified here:** nothing renders these yet; the pills and the Progress tab (tickets 02 to 04) do the device check.
