# 03: Search and chips with the empty state

**What to build:** The list gets a search box and one sideways-scrolling row of six muscle-group chips (Arms, Back, Chest, Core, Legs, Shoulders, A–Z). Typing and tapping chips narrow the list through the filter function. One group can be active at a time, tapping the active chip clears it, and it combines with the search. When nothing matches, the list is replaced by a message naming what was searched, with a Clear filters button. Search text and chips are still set when the lifter comes back from an exercise.

**Blocked by:** 01, 02

**Status:** built; checked by tsc, lint and Jest only

- [ ] The list updates as the lifter types, with no search button
- [ ] The chip row has the six groups, A–Z, with capitalised labels, and scrolls sideways if needed; there is no equipment row
- [ ] Picking a second group replaces the first; tapping the active chip turns it off
- [ ] The active chip uses the accent style and is clearly different from the rest
- [ ] Search and group combine (for example "Arms" and "press")
- [ ] With no match, the message says no exercises match what was searched, and Clear filters returns the full list in one tap; there is no create-exercise shortcut
- [ ] Going to an exercise and back keeps the search text and chips
- [ ] The screen only displays what the filter function returns; no rules are duplicated
- [ ] Chips and buttons are at least 44 pt; colours, sizes and fonts come from the tokens
- [ ] Type check, lint and Jest all pass
