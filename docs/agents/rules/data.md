# Data and correctness rules

1. **Store weights in kg only.** Keep `entered_unit` alongside. Convert only for display, and never write a converted value back.
2. **Derive records, never store them.** Heaviest set, estimated 1RM and most volume are queried from `sets`. The Target shown at the start of a workout and whether the lifter accepted a step are not records: they are stored on `workout_exercises`.
3. **Keep the overload engine and unit conversion pure.** They take plain inputs and do no I/O. They don't touch React or the database. Every rule change comes with a unit test.
4. **Round targets to a multiple of the Jump.** The engine knows only the Jump, not plates or bar weight. A step up goes to the next multiple strictly above the current weight; a drop or deload rounds down. Every other Target (a Hold, a Stay, no Streak yet, an accepted stored Target) snaps to the nearest multiple of the Jump it was given, an exact tie rounding up, so a Target set in the other unit or under another Jump stays loadable (10 kg with a 5 lb Jump is 20 lb, not 22.05 lb). A small tolerance leaves a Target already on the grid untouched, and bodyweight Targets (0) never change. The snap lives in the engine, so Start, the Today preview, the Offer and the summary agree; a snapped Target is a changed Target and restarts the Streak. Stored sets never change.
5. **Every schema change is a Drizzle migration.** Never edit the database by hand or change a shipped migration. The backup file carries a format version. A version bump needs a matching import path for older files.

See `docs/architecture.md` for the data model, units and backup format.
