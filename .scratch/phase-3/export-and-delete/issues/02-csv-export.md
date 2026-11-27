# 02: CSV export, end to end

**What to build:** A Pro lifter taps "Export your progress" on Your data, lands on the Export progress screen with Spreadsheet ticked, picks a Time range (30 days / 3 months / All time), sees the Preview and "Export N sets", and shares a CSV from the share sheet. A free or refunded lifter sees the row with a Pro tag, and it opens the Paywall and returns to Your data after buying. Zero sets disables the button with "No sets in this range."

**Blocked by:** 01

**Status:** resolved

- [x] CSV has date, workout, exercise, set, reps, `weight`, `unit`, `weight_kg` (two decimals) and `is_warmup`; done sets of finished workouts only; a Workout in progress and skipped sets are left out; commas and quotes in names are quoted correctly.
- [x] The range filters by workout date; the button count equals the row count; an empty range gives zero rows.
- [x] The share sheet gets `Increment export {date}.csv`, which opens in a spreadsheet on both OSes.
- [x] The row replaces the "Later" placeholders on Your data; the Pro gate is read through the one gate.
- [x] Unit tests for the export build (seam 1) and the gate (seam 3); type check, lint and tests pass.
