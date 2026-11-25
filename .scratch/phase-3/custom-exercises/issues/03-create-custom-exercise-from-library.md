# 03: Create a custom exercise from the Library +

**What to build:** A Pro lifter taps **+** in the Library header, fills in a custom exercise and saves it; a free lifter taps the same button and sees the Paywall.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] The New exercise screen matches the updated canvas: Name, six Main muscle chips, six Equipment chips, step boxes (10 steps, 200 characters each, empty ones ignored). No "How you track it".
- [ ] Name rules: trimmed, 1 to 40 characters, unique against every library and custom exercise ignoring case, with the message "You already have an exercise called {Name}." and Save off. A pure function with tests.
- [ ] Saved rows: no slug, `is_custom` true, muscles as the lowercase group name (the group lookup learns back, legs, arms, core), load type bodyweight for Bodyweight equipment and weighted for everything else.
- [ ] The Library **+** appears for everyone. A free lifter sees a small lock and the Paywall opens. The check lives in the one Pro-gate place, with no `isPro` check in the component (product rule 7).
- [ ] Save returns to the Library list with the new exercise visible. Cancel returns to the Library.
- [ ] Exercise detail hides the "How to" heading when there are no steps, and shows the muscle and equipment pills for a custom exercise.
- [ ] The custom exercise appears in the Library, the routine picker and the Progress picker, and filters under its muscle group chip.
- [ ] Type check, lint and tests pass.
