# 06: All records screen

**What to build:** A Pro lifter opens All records from "See all records" and sees every trained exercise's records.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] The records read module returns, in the current unit, every exercise with at least one counted set, most recently done first, with each record, its date, a "New" flag (set in the exercise's last finished workout) and the muscle group, plus the banner totals (tests: only trained exercises listed, order, New flag, bodyweight exercise lists two records, an unused custom exercise left out).
- [ ] The screen matches the updated canvas: back button, "Personal records" with a Pro pill, chips ("All" plus only muscle groups present), banner "N records · N new", one card per exercise, read-only.
- [ ] "See all records" opens it for Pro; a free lifter keeps the Paywall (ticket 05).
- [ ] Type check, lint and tests pass.
