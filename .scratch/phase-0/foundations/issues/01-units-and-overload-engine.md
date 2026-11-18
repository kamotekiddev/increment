# 01: Units and overload engine

**What to build:** A lifter's weights convert between kg and lb without ever changing what is stored, and the app can work out the next Target for any exercise from its history, for every rule in the spec.

**Blocked by:** None (can start immediately).

**Status:** resolved (built and tested in the planning session; waiting for the owner to ask for a commit)

- [x] Weights entered in lb display exactly as typed; switching units any number of times never changes the stored kg value
- [x] The engine returns a Target, an optional proposal and a reason for: first workout, on-track, hold, miss, miss-keep, miss-drop, earned, progressed, at-top-of-range, deload
- [x] Steps work for weight, reps and both, with bodyweight exercises limited to reps
- [x] Jumps derived from pounds never round one multiple off
- [x] Deload counts training weeks, is off unless set, and never counts as a miss or a Streak workout
- [x] Type check, lint and Jest all pass
