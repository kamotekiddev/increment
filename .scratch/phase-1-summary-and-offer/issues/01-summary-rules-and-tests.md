# 01: Summary rules and tests

**What to build:** The pure summary builder from the spec, with Jest tests: header (duration, sets, volume or total reps), one card per exercise with done sets, outcome, a one-line wording from the engine's reason, the next Target, and an optional Offer. Nothing visible on a phone yet.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Header shows duration in minutes, set count, and volume in kg (done working sets, weight × reps)
- [ ] Volume of 0 is replaced by total reps; weighted bodyweight sets count their added load
- [ ] Skipped exercises (no done sets) have no card
- [ ] Each card has outcome, reason line and next Target; Streak progress appears only on Clean cards
- [ ] An Offer appears only when the engine returns a proposal, and carries the proposed Target
- [ ] With the step accepted, the next Target is the stepped-up Target; declined or unanswered keeps the current one
- [ ] Hold, Miss (with and without a drop), baseline, top of range and Deload each have wording and a test
- [ ] Plain inputs only, no database or React; engine unchanged; type check, lint and tests pass
