# 01: Filter function and tests

**What to build:** One plain function decides which exercises match a search and a muscle group, and returns them in A–Z order by name. It depends on nothing but its inputs, so it can be tested without a database or a screen. Every rule in the spec has an example test.

**Blocked by:** None (can start immediately)

**Status:** built; checked by tsc, lint and Jest only

- [ ] Every typed word must appear somewhere in the exercise name, in any order, ignoring capitals ("dumbbell bench" finds "Dumbbell Bench Press")
- [ ] A word that appears only in the how-to text does not match
- [ ] A group chip (Arms, Back, Chest, Core, Legs, Shoulders) matches when any of the exercise's muscles belongs to it ("Arms" finds Barbell Bench Press)
- [ ] Every muscle in the library belongs to one of the six groups, checked by a test
- [ ] Search and group combine; with nothing set, all exercises come back; there is no equipment filter
- [ ] Results are in A–Z order by name
- [ ] A search with no match returns an empty list, and extra spaces around the text are ignored
- [ ] The six groups are fixed and sorted A–Z; a row's groups are listed once each in the order its muscles are listed
- [ ] Type check, lint and Jest all pass
