# Data and correctness rules

1. **Store weights in kg only.** Keep `entered_unit` alongside. Convert only for display, and never write a converted value back.
2. **Derive records, never store them.** Heaviest set, estimated 1RM and most volume are queried from `sets`.
3. **Keep the overload engine and unit conversion pure.** They take plain inputs and do no I/O. They don't touch React or the database. Every rule change comes with a unit test.
4. **Round targets to loadable weights.** Use the equipment's smallest jump and the plates the user has.
5. **Every schema change is a Drizzle migration.** Never edit the database by hand or change a shipped migration. The backup file carries a format version. A version bump needs a matching import path for older files.

See `docs/architecture.md` for the data model, units and backup format.
