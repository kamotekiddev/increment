# 03: Search and chips with the empty state

**What to build:** The list gets a search box and two sideways-scrolling chip rows, one for muscle and one for equipment. Typing and tapping chips narrow the list through the filter function. One muscle and one equipment can be active at a time, tapping the active chip clears it, and all three combine. When nothing matches, the list is replaced by a message naming what was searched, with a Clear filters button. Search text and chips are still set when the lifter comes back from an exercise.

**Blocked by:** 01, 02

**Status:** ready-for-agent

- [ ] The list updates as the lifter types, with no search button
- [ ] The muscle row has one chip per muscle in the library and scrolls sideways; the equipment row does the same
- [ ] Picking a second muscle replaces the first; same for equipment; tapping the active chip turns it off
- [ ] The active chip uses the accent style and is clearly different from the rest
- [ ] Search, muscle and equipment combine (for example "Dumbbell" and "Triceps" and "press")
- [ ] With no match, the message says no exercises match what was searched, and Clear filters returns the full list in one tap; there is no create-exercise shortcut
- [ ] Going to an exercise and back keeps the search text and chips
- [ ] The screen only displays what the filter function returns; no rules are duplicated
- [ ] Chips and buttons are at least 44 pt; colours, sizes and fonts come from the tokens
- [ ] Type check, lint and Jest all pass
