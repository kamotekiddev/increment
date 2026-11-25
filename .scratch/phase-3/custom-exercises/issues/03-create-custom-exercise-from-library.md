# 03: Create a custom exercise from the Library +

**What to build:** Any lifter taps **+** in the Library header and fills in a custom exercise. A Pro lifter saves it; a free lifter sees **Unlock Pro** where Save is, and it opens the Paywall.

**Blocked by:** 01

**Status:** built

- [x] The New exercise screen matches the updated canvas: Name, six Main muscle chips, six Equipment chips, step boxes (10 steps, 200 characters each, empty ones ignored). No "How you track it".
- [x] Name rules: trimmed, 1 to 40 characters, unique against every library and custom exercise ignoring case, with the message "You already have an exercise called {Name}." and Save off. A pure function with tests.
- [x] Saved rows: no slug, `is_custom` true, muscles as the lowercase group name (the group lookup learns back, legs, arms, core), load type bodyweight for Bodyweight equipment and weighted for everything else.
- [x] The Library **+** opens New exercise for everyone, with no lock. For a free lifter the bottom button is **Unlock Pro** (lock icon) in place of Save exercise, opens the Paywall and saves nothing; the typed values stay, and the button becomes Save exercise as soon as Pro switches on. The check lives in the one Pro-gate place, with no `isPro` check in the component (product rule 7).
- [x] Save returns to the Library list with the new exercise visible. Cancel returns to the Library.
- [x] Exercise detail hides the "How to" heading when there are no steps, and shows the muscle and equipment pills for a custom exercise.
- [x] The custom exercise appears in the Library, the routine picker and the Progress picker, and filters under its muscle group chip.
- [x] Type check, lint and tests pass.
