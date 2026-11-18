# 01: Unit preference and formatters

**What to build:** The `settings` table, the `useUnit()` hook and unit-aware formatters, with tests. Nothing visible on a phone yet.

**Blocked by:** None (can start immediately)

**Status:** built

- [x] A single-row `user_settings` table with `unit` defaulting to kg, one migration, row created on first read
- [x] `useUnit()` returns the unit and a setter; screens re-render on change
- [x] Every formatter that prints a weight takes the unit and prints its label (Target, Last, volume, Next up, banner, summary card line)
- [x] Jest tests for each formatter in kg and lb
- [x] A database test: write 135 lb, switch the unit 10 times, `weight_kg` and `entered_unit` are unchanged at full precision
- [x] Type check, lint and tests pass
