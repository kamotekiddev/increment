# 04: No-match "Create" row, in the Library and the picker

**What to build:** Searching for something that doesn't exist offers to create it, from the Library and from a routine's Add exercises picker.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Under the no-match card, a "Create “{search}”" row (as on the `LibraryEmpty` board), in both the Library tab and the routine picker. The picker has no **+**.
- [ ] A Pro lifter opens New exercise with the Name pre-filled with the search text. A free lifter sees the grey Pro tag and the Paywall opens.
- [ ] From the picker, Save returns to the picker with the new exercise picked and its setup open. From the Library, Save returns to the list. Cancel returns to where the lifter started.
- [ ] Buying Pro from the Paywall opened here lands the lifter back where they were (not over a live workout; the picker is not one).
- [ ] The `docs/screens.md` "No search results" row is correct.
- [ ] Type check, lint and tests pass.
