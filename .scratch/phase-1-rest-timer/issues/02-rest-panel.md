# 02: Rest panel and countdown

**What to build:** The rest panel on the live workout screen, driven by the rules from ticket 01. Checking a set starts a visible countdown; Skip and ±15s work; the timer survives minimizing the workout. Hide-at-zero works, with no buzz, advance or notification yet.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] A small Zustand store holds the running rest as an end time plus its length, the starting set and its exercise; it lives outside the screen so minimizing and returning keeps the countdown
- [ ] The panel matches `Workout.dc.html`: ring, `m:ss` with "rest", "Next up" line, −15s, +15s and Skip, pinned to the bottom, using design tokens and at least 44 pt touch targets
- [ ] The panel shows only while a rest runs; the list scrolls clear of it while it shows
- [ ] Checking, replacing, unchecking, Skip, ±15s, Finish and Discard behave as the rules say
- [ ] At zero the panel hides
- [ ] Screen reader labels on the three buttons and the countdown; the ring is decorative
- [ ] Type check, lint and tests pass
