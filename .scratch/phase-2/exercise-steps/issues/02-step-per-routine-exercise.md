# 02: A step per routine exercise drives the Targets

**What to build:** Each routine exercise carries its own step, one for kg and one for lb, empty until the lifter sets it; an empty step is 2.5 kg or 5 lb for every exercise. Everything that steps or rounds a weight uses the routine exercise's step for the lifter's current unit: Start, the Offer, the summary, the Today preview, pre-fills, untouched live rows and the Last column. The per-equipment Jumps are gone: the Weight jumps screen, its Settings row and the saved Jumps are removed. A dumbbell curl now steps by 2.5 kg and a leg press by 2.5 kg until the lifter changes them (ticket 03). Switching unit never writes a step.

**Blocked by:** 01

**Status:** built

- [ ] One migration adds a nullable kg step and lb step to routine exercises and drops the five Jump columns from the settings row without copying them (owner decision 2026-11-21: the app is not released)
- [ ] One pure function gives a routine exercise's step for a unit: its saved step for that unit, else 2.5 kg / 5 lb
- [ ] Every place that took an equipment Jump takes the routine exercise's step instead; a workout whose routine exercise was deleted uses the default step
- [ ] The Weight jumps screen, its Settings row, the Jump store and hook are removed; Settings still opens and shows the other rows
- [ ] Jest: the default step in each unit; a saved kg step used in kg and ignored in lb; a step up from 60 kg with a saved 5 kg step is 65 kg; switching unit 10 times leaves both steps unchanged
- [ ] Database test: the migration keeps routine exercises and their rules, leaves both steps empty, and the settings row has no Jump columns
- [ ] Type check, lint and tests pass
