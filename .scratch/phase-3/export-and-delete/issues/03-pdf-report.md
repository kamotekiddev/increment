# 03: PDF report

**What to build:** Switching the Export screen to PDF report shares `Increment report {date}.pdf`: a totals header, a records table and one Weight-over-time chart per exercise (reps for a bodyweight exercise), for the chosen Time range.

**Blocked by:** 02

**Status:** resolved

- [x] `expo-print` is added with `npx expo install`, after checking the SDK docs.
- [x] Chart rules match Progress: one point per finished workout with a value, skipped workouts never plotted as 0, under 2 points shows the muted line.
- [x] The PDF data model is covered by unit tests (seam 1).
- [ ] Phone check: a long report breaks pages without cutting a chart (owner phone check; the HTML sets `break-inside: avoid` on each exercise block).
- [x] Type check, lint and tests pass.
