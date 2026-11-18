# 05: Phone check, docs and mockup

**What to build:** Owner checks the rest timer on an iPhone and an Android phone, docs are updated, and the prepared mockup edit is published when the owner asks.

**Blocked by:** 03, 04

**Status:** owner-check

- [ ] Owner device checklist, on both phones:
  - checking a set starts the right countdown; −15s, +15s and Skip work; checking another set restarts it
  - unchecking the starting set cancels it, and unchecking another set does not
  - no rest starts after the last open set of the Workout
  - at zero with sets left: buzz and the panel hides
  - at zero with the exercise finished: buzz and the next exercise opens; with the lifter on another exercise it does not move
  - minimize the workout and return: the countdown is right
  - lock the phone through a rest: the notification arrives, and its timing on Android is noted
  - deny the permission prompt: the timer still works, and the prompt never returns
- [x] `docs/product.md` and `docs/screens.md` updated (rest timer no longer "not yet"; notification permission note beside the onboarding line); `docs/roadmap.md` and the Phase 1 map updated
- [x] "Next up" line edit to `Workout.dc.html` prepared locally; published only when the owner asks
- [ ] If Android notifications arrive late, the exact-alarm permission is raised as an open item in `docs/decisions.md` for the owner
- [ ] Type check, lint and tests pass
