# 04: Bodyweight and not-enough-data states

**What to build:** A bodyweight exercise charts its reps, and a chart that can't draw a line says why.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] A bodyweight exercise's toggle is "Reps in a set" / "Reps in a workout", the y-axis is in reps, and the weighted metrics are refused for it (read tests).
- [ ] Fewer than 2 plottable points shows "Your chart starts after your second workout." in the chart area; the toggle stays.
- [ ] A metric with no values (Est. 1RM with every set over 12 reps) shows "No Est. 1RM yet: every set was over 12 reps."; a workout with no value is skipped, never plotted as 0.
- [ ] A custom exercise charts like a library one.
- [ ] Type check, lint and tests pass.
