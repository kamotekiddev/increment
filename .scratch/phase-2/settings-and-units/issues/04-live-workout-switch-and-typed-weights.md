# 04: Live workout switch and typed weights

**Update 2026-11-20:** the pill was removed. The live workout has no unit switch; the unit changes only in Settings. The typed-weight criteria below still hold.

**What to build:** ~~The `kg | lb` pill in the live workout header, and~~ weights typed in the unit on screen.

**Blocked by:** 01, 03

**Status:** built

- ~~The pill beside "Exercise N of M"~~ (removed)
- [ ] A typed weight is read in the unit on screen, saved as kg through `toKg`, with `entered_unit` set to that unit when the set is checked
- [ ] Jest tests for the keep-exact-kg and read-in-current-unit rules
- [ ] Type check, lint and tests pass
