# 03: Split bodyweight-or-weighted exercises

**What to build:** Each of the six `bodyweight_or_weighted` library exercises becomes two: the existing one turns `bodyweight`, and a new "Weighted …" one is `weighted` with equipment `bodyweight`. The load type `bodyweight_or_weighted` no longer exists.

**Blocked by:** None (can start immediately)

**Status:** built

- [x] `exercises.json`: Pullups, Chin-Up, Dips - Triceps Version, Bench Dips, Hyperextensions, Glute Ham Raise each get a weighted twin with its own slug and name; the originals become `bodyweight`
- [x] Seed upserts the change on existing installs; workouts already logged keep their exercise id and history
- [x] `bodyweight_or_weighted` removed from `LoadType`, the schema, the engine and every switch on load type
- [ ] A weighted twin steps by weight using the Bodyweight added weight Jump (once 01 lands)
- [x] Seed test: no exercise has the removed load type, and each pair exists
- [x] Type check, lint and tests pass
