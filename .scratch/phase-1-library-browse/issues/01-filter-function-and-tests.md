# 01: Filter function and tests

**What to build:** One plain function decides which exercises match a search, a muscle and an equipment, and returns them in A–Z order by name. It depends on nothing but its inputs, so it can be tested without a database or a screen. Every rule in the spec has an example test.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Every typed word must appear somewhere in the exercise name, in any order, ignoring capitals ("dumbbell bench" finds "Dumbbell Bench Press")
- [ ] A word that appears only in the how-to text does not match
- [ ] A muscle matches when the exercise lists it anywhere ("Triceps" finds Barbell Bench Press)
- [ ] Equipment matches on equal value
- [ ] Search, muscle and equipment combine; with nothing set, all exercises come back
- [ ] Results are in A–Z order by name
- [ ] A search with no match returns an empty list, and extra spaces around the text are ignored
- [ ] The muscle and equipment options for the chips are worked out from the library's own values, not a hard-coded list
- [ ] Type check, lint and Jest all pass
