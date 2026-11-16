# 05: Discard, and one workout at a time

**What to build:** A ⋯ menu on the live workout with Discard workout behind a confirmation. Starting any routine while a workout is in progress shows Resume or Discard-and-start instead of starting a second one.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] Discard deletes the workout, its Workout exercises and its sets, and returns to where it started
- [ ] Start with a workout already in progress shows the prompt; Resume reopens it, Discard deletes it then starts the new one
- [ ] Only one workout in progress can exist
- [ ] Type check, lint and tests pass
