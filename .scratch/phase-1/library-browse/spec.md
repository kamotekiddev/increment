Status: ready-for-agent

# Phase 1 · Feature 1 · Library browse

Part of Phase 1 (see `.scratch/phase-1/map.md`). Needs: Phase 0 only.

## Problem Statement

The Library tab is a placeholder. The lifter has 178 exercises seeded on their phone but no way to look through them, find one, or read how to do it. Routines (the next feature) also need a way to pick exercises from the library, and building a second list there would mean two copies of the same search and filters.

## Solution

The Library tab shows every exercise in A–Z order. The lifter can type to search by name and tap one muscle-group chip (Arms, Back, Chest, Core, Legs or Shoulders) to narrow the list. Tapping an exercise opens a read-only detail screen with its specific muscles, equipment and numbered how-to steps. The list, search box and chips are built as one reusable piece, so Routines can later show the same list as its exercise picker with a different action on tap.

## User Stories

1. As a lifter, I want the Library tab to list all the exercises on my phone, so that I can see what is available.
2. As a lifter, I want the list in A–Z order, so that I can find a name by scanning.
3. As a lifter, I want each exercise shown with its name exactly as in the library, so that names match what I see elsewhere in the app.
4. As a lifter, I want each row to show the muscle groups the exercise works (for example "Chest · Shoulders · Arms"), so that I can tell what it trains without opening it.
5. As a lifter, I want to tap a row to open the exercise, so that I can read about it.
6. As a lifter, I want a search box at the top of the list, so that I can find an exercise by typing.
7. As a lifter, I want search to match words from the name in any order, so that "dumbbell bench" finds "Dumbbell Bench Press" and "Incline Dumbbell Bench Press".
8. As a lifter, I want search to ignore capital letters, so that I do not have to think about how I type.
9. As a lifter, I want search to look at names only, so that results are predictable and not cluttered by words from how-to text.
10. As a lifter, I want the list to update as I type, so that I do not have to press a search button.
11. As a lifter, I want one row of muscle-group chips (Arms, Back, Chest, Core, Legs, Shoulders), so that I can narrow the list to a part of the body without wading through specific muscles.
12. As a lifter, I want a group chip to match an exercise when any of its muscles belongs to that group, so that "Arms" also shows Barbell Bench Press (it works the triceps).
13. As a lifter, I want the chips in A–Z order with capitalised labels, so that they are easy to scan.
14. As a lifter, I want the exercise detail to still show the specific muscles and the equipment, so that the list stays simple but I can see the detail when I open one.
15. As a lifter, I want to select only one group chip at a time, so that picking a second group replaces the first instead of emptying the list.
16. As a lifter, I want the row to list each group once, in the order the exercise's muscles are listed, so that a squat reads "Legs" and not "Legs · Legs · Legs".
17. As a lifter, I want the group chip and the search text to combine, so that I can find arm exercises with "press" in the name.
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
- Takes the list of exercises, the search text and an optional muscle group. Returns the matching exercises in A–Z order by name.
- Search splits the text into words. Every word must appear somewhere in the exercise name, in any order, ignoring capitals. Only names are searched. There is no typo forgiveness.
- A group matches when any of the exercise's muscles belongs to it. The six groups and their muscles are: Arms (biceps, triceps, forearms), Back (lats, middle back, lower back, traps), Chest (chest), Core (abdominals), Legs (quadriceps, hamstrings, glutes, calves, adductors, abductors), Shoulders (shoulders). The mapping lives in one place and a test checks that every muscle in the library belongs to a group.
- Search and group combine: an exercise must satisfy both when both are set. With nothing set, all exercises are returned. There is no equipment filter.
- The chips are the six groups, sorted A–Z. They are fixed, not read from the library.

**List component** (reusable)
- One component renders the search box, the chip row, the list and the empty state. It takes a "what happens when a row is tapped" option. The Library tab passes "open the detail". Routines will pass "add to routine".
- Each row shows the name and a muted line of the muscle groups the exercise works, each once, in the order its muscles are listed, joined with " · " (for example "Chest · Shoulders · Arms"). No equipment on the row.
- The chip row scrolls sideways. One group can be active at a time. Tapping the active chip clears it. The active chip uses the accent style from the design system.
- The empty state says no exercises match what was searched, with a Clear filters button. There is no create-exercise shortcut; that waits for custom exercises in Phase 3.
- The list is virtualised so 178 rows scroll smoothly.

**Exercise detail** (read-only)
- A full screen pushed over the tabs, with a back button. It shows the name, pills for each muscle and the equipment, and a "How to" section with the steps numbered in order.
- The load type is not shown. There is no History tab, Edit button or Delete; those belong to Phase 2 and Phase 3.
- Search text and chips are kept while the lifter is on the detail screen, so going back returns to the same filtered list.

**UI**
- Built from the existing base components and tokens (text, pill, input, card); no hard-coded colours, sizes or fonts. Touch targets are at least 44 pt.

## Testing Decisions

- A good test checks external behaviour only: given a list of exercises, a search and a group, assert which exercises come back and in what order. Tests never reach into helpers.
- **Seam 1: the filter function.** One seam, plain inputs and outputs. Examples to cover: a word in the name matches ("bench"); several words in any order match ("dumbbell bench"); capitals are ignored; a word that is only in the how-to text does not match; a group matches when any muscle belongs to it ("Arms" finds Barbell Bench Press); search and group combine; nothing set returns all exercises in A–Z order; a search with no match returns an empty list; extra spaces around the text are ignored; every muscle in the library belongs to a group; a row's groups are listed once each in muscle order.
- **Seam 2: on the device.** No automated test. The owner opens the Library in Expo Go on an iPhone and an Android phone: scrolls the list, searches, uses the group chips, hits the empty state and clears it, opens a detail, goes back to find the filters still set. Jest cannot run the native database, so this stays a manual check, plus the type checker and lint.
- Prior art: the engine and units test suites, which test pure functions with plain inputs and outputs.

## Out of Scope

- Creating, editing or deleting custom exercises (Phase 3, Pro) and the create shortcut on the empty state.
- Exercise history, records, charts and the History tab on the detail (Phase 2 and 3).
- The exercise picker screen inside Routines. This feature only builds the reusable list it will use (feature 2).
- Choosing several groups at once, filtering by equipment or load type, searching muscles or how-to text, and typo-tolerant search.
- Images or videos; the library has none.
- Renaming or cleaning the seeded exercise names.
- Favourites, recently used and sorting options other than A–Z.
- Dark theme values.

## Further Notes

- Refined after the first build: the equipment chip row was dropped, and the muscle chips became six groups so the list stays simple. The specific muscles and equipment are shown on the detail screen.

- Refined on 2026-11-19 to match the Library frame on the design canvas. These points replace the decisions above:
  - Rows are white cards with an equipment tile. The muted line is the main group and the equipment, e.g. "Chest · Barbell" (replaces story 16 and "No equipment on the row").
  - A row ends in an "N routines" pill when the exercise is in a routine, or a chevron when it is in none.
  - The chips run All, Chest, Back, Legs, Shoulders, Arms, Core (replaces the A–Z order in story 13). All is active when no group is set, and tapping the active chip still clears it.
  - Chips draw 40 pt tall, with touch padding to 44 pt.
  - The search box is a white pill with a search icon and an accent ring while focused.
  - A "6 results" count shows while a search or group is set.
  - The empty state is a card naming the search, with Clear filters.
  - Still left out until Phase 3 (custom exercises): the header "+", and the "Create …" card on the empty state.
  - Still left out because search has no typo forgiveness: the empty state's suggested exercises.
  - Tiles keep the two icons (weighted, bodyweight) the routine screens use, not one icon per equipment.
  - Exercise detail drops the native header. A white hero card at the top holds the art (a loaded bar, or a flexed arm for bodyweight), a round back button and the "N routines" pill. Below it come the name in the screen title style and pills: the first muscle in accent, the rest and the equipment in white. The how-to steps sit next to numbered accent circles.
  - Still left out of Exercise detail until Phase 2: the How to / History switch (feature 4, Exercise history), and the Best set and Est. max tiles (feature 5, Records). Until the switch arrives, a "How to" heading stays. The "Add to routine" button is also left out: no spec yet says which routine it adds to.
- Library records and Pro limits are not touched, so there is no free-versus-Pro check in this feature.
- Docs to update in the same change: `docs/screens.md` (the "No search results" row loses its create shortcut until Phase 3) and the Phase 1 map once this feature is built.
- The glossary has no entry for an exercise itself; no new terms came out of this feature, so none were added.
- Open item for the owner: check the Library on both phones before Routines starts.
