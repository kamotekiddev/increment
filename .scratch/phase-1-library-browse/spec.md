Status: ready-for-agent

# Phase 1 · Feature 1 · Library browse

Part of Phase 1 (see `.scratch/phase-1-core-training-loop/map.md`). Needs: Phase 0 only.

## Problem Statement

The Library tab is a placeholder. The lifter has 178 exercises seeded on their phone but no way to look through them, find one, or read how to do it. Routines (the next feature) also need a way to pick exercises from the library, and building a second list there would mean two copies of the same search and filters.

## Solution

The Library tab shows every exercise in A–Z order. The lifter can type to search by name and tap one muscle chip and one equipment chip to narrow the list. Tapping an exercise opens a read-only detail screen with its muscles, equipment and numbered how-to steps. The list, search box and chips are built as one reusable piece, so Routines can later show the same list as its exercise picker with a different action on tap.

## User Stories

1. As a lifter, I want the Library tab to list all the exercises on my phone, so that I can see what is available.
2. As a lifter, I want the list in A–Z order, so that I can find a name by scanning.
3. As a lifter, I want each exercise shown with its name exactly as in the library, so that names match what I see elsewhere in the app.
4. As a lifter, I want each row to show a small line with the muscle and equipment, so that I can tell similar exercises apart without opening them.
5. As a lifter, I want to tap a row to open the exercise, so that I can read about it.
6. As a lifter, I want a search box at the top of the list, so that I can find an exercise by typing.
7. As a lifter, I want search to match words from the name in any order, so that "dumbbell bench" finds "Dumbbell Bench Press" and "Incline Dumbbell Bench Press".
8. As a lifter, I want search to ignore capital letters, so that I do not have to think about how I type.
9. As a lifter, I want search to look at names only, so that results are predictable and not cluttered by words from how-to text.
10. As a lifter, I want the list to update as I type, so that I do not have to press a search button.
11. As a lifter, I want a row of muscle chips, so that I can narrow the list to one muscle.
12. As a lifter, I want a muscle chip to match an exercise that lists that muscle anywhere, so that "Triceps" also shows Barbell Bench Press.
13. As a lifter, I want the muscle chips to scroll sideways, so that all 16 muscles fit without crowding the screen.
14. As a lifter, I want a row of equipment chips, so that I can narrow the list to the equipment I have.
15. As a lifter, I want to select only one muscle chip at a time, so that picking a second muscle replaces the first instead of emptying the list.
16. As a lifter, I want to select only one equipment chip at a time, for the same reason.
17. As a lifter, I want the muscle chip, the equipment chip and the search text to combine, so that I can find dumbbell triceps exercises with "press" in the name.
18. As a lifter, I want to tap the active chip again to turn it off, so that I can clear a filter without a separate control.
19. As a lifter, I want the active chip to look clearly different from the others, so that I know which filters are on.
20. As a lifter, I want a message when nothing matches, so that I know the list is empty on purpose.
21. As a lifter, I want that message to name what I searched for, so that I can spot a typo.
22. As a lifter, I want a Clear filters button on the empty message, so that I can get back to the full list in one tap.
23. As a lifter, I want the exercise detail to open as a full screen with a back button, so that I can return to my place in the list.
24. As a lifter, I want my search text and chips to still be there when I come back from an exercise, so that I can open the next result without starting again.
25. As a lifter, I want the exercise detail to show the name at the top, so that I know I opened the right one.
26. As a lifter, I want the detail to show pills for every muscle and for the equipment, so that I know what it trains and what I need.
27. As a lifter, I want the how-to steps numbered in order, so that I can follow them.
28. As a lifter, I want long steps to be readable and not cut off, so that I get the whole instruction.
29. As a lifter, I want the list to scroll smoothly with 178 rows, so that browsing feels fast on an older phone.
30. As a lifter, I want rows and chips to be at least 44 pt tall, so that I can tap accurately.
31. As a lifter, I want the screens to use the app's font and colours, so that the Library feels like the rest of the app.
32. As a lifter, I want the Library to work with no internet, so that I can look things up in a gym with no signal.
33. As the developer, I want the search and filter rules in one plain function, so that I can test them without a database or screen.
34. As the developer, I want the list, search box and chips built as one reusable piece with a choice of what happens on tap, so that Routines can use it as its exercise picker without a second copy.
35. As the developer, I want the screens to only display what the filter function returns, so that rules live in one place.
36. As the owner, I want read-only behaviour here, with no edit, history or create buttons, so that Phase 2 and Phase 3 work is not built early.

## Implementation Decisions

**Data**
- Exercises are read from the existing exercises table, which holds the 178 seeded rows: name, muscles, equipment, load type and how-to steps. No schema change and no migration.
- The full list is loaded once and filtered in memory. At 178 rows this is simpler than querying per keystroke.
- Names are shown exactly as seeded. Any renaming is a separate change to the curated library, not part of this feature.

**Filter function** (pure; no I/O)
- Takes the list of exercises, the search text, an optional muscle and an optional equipment. Returns the matching exercises in A–Z order by name.
- Search splits the text into words. Every word must appear somewhere in the exercise name, in any order, ignoring capitals. Only names are searched. There is no typo forgiveness.
- A muscle matches when the exercise's muscle list contains it anywhere. Equipment matches on equal value.
- Search, muscle and equipment combine: an exercise must satisfy all that are set. With nothing set, all exercises are returned.
- The muscle and equipment options shown as chips come from the library's own values, not a hard-coded list, so a later library change does not need a code change here.

**List component** (reusable)
- One component renders the search box, the two chip rows, the list and the empty state. It takes a "what happens when a row is tapped" option. The Library tab passes "open the detail". Routines will pass "add to routine".
- Each row shows the name and a muted line "Muscle · Equipment", using the first listed muscle.
- Chip rows scroll sideways. One muscle and one equipment can be active at a time. Tapping the active chip clears it. The active chip uses the accent style from the design system.
- The empty state says no exercises match what was searched, with a Clear filters button. There is no create-exercise shortcut; that waits for custom exercises in Phase 3.
- The list is virtualised so 178 rows scroll smoothly.

**Exercise detail** (read-only)
- A full screen pushed over the tabs, with a back button. It shows the name, pills for each muscle and the equipment, and a "How to" section with the steps numbered in order.
- The load type is not shown. There is no History tab, Edit button or Delete; those belong to Phase 2 and Phase 3.
- Search text and chips are kept while the lifter is on the detail screen, so going back returns to the same filtered list.

**UI**
- Built from the existing base components and tokens (text, pill, input, card); no hard-coded colours, sizes or fonts. Touch targets are at least 44 pt.

## Testing Decisions

- A good test checks external behaviour only: given a list of exercises and a search, muscle and equipment, assert which exercises come back and in what order. Tests never reach into helpers.
- **Seam 1: the filter function.** One seam, plain inputs and outputs. Examples to cover: a word in the name matches ("bench"); several words in any order match ("dumbbell bench"); capitals are ignored; a word that is only in the how-to text does not match; a muscle matches when it is listed anywhere in an exercise's muscles ("Triceps" finds Barbell Bench Press); equipment matches exactly; search, muscle and equipment combine; nothing set returns all exercises in A–Z order; a search with no match returns an empty list; extra spaces around the text are ignored.
- **Seam 2: on the device.** No automated test. The owner opens the Library in Expo Go on an iPhone and an Android phone: scrolls the list, searches, uses both chip rows, hits the empty state and clears it, opens a detail, goes back to find the filters still set. Jest cannot run the native database, so this stays a manual check, plus the type checker and lint.
- Prior art: the engine and units test suites, which test pure functions with plain inputs and outputs.

## Out of Scope

- Creating, editing or deleting custom exercises (Phase 3, Pro) and the create shortcut on the empty state.
- Exercise history, records, charts and the History tab on the detail (Phase 2 and 3).
- The exercise picker screen inside Routines. This feature only builds the reusable list it will use (feature 2).
- Choosing several muscles or several equipment at once, filtering by load type, searching muscles or how-to text, and typo-tolerant search.
- Images or videos; the library has none.
- Renaming or cleaning the seeded exercise names.
- Favourites, recently used and sorting options other than A–Z.
- Dark theme values.

## Further Notes

- Library records and Pro limits are not touched, so there is no free-versus-Pro check in this feature.
- Docs to update in the same change: `docs/screens.md` (the "No search results" row loses its create shortcut until Phase 3) and the Phase 1 map once this feature is built.
- The glossary has no entry for an exercise itself; no new terms came out of this feature, so none were added.
- Open item for the owner: check the Library on both phones before Routines starts.
