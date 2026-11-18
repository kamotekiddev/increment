# 02: Browse list opens exercise detail

**What to build:** The Library tab shows all 178 exercises in A–Z order, each row with the name and a muted line of muscle groups. Tapping a row opens a read-only full screen with the name, pills for every muscle and the equipment, and the how-to steps numbered in order. The list is one reusable piece that takes a "what happens when a row is tapped" option, so Routines can use it as its picker later; the Library tab passes "open the detail".

**Blocked by:** None (can start immediately)

**Status:** built; checked by tsc, lint and Jest only

- [ ] The Library tab lists every seeded exercise in A–Z order, with names exactly as seeded
- [ ] Each row shows the name and the groups it works, once each in muscle order, joined with " · " (for example "Chest · Shoulders · Arms"), with no equipment
- [ ] The list scrolls smoothly and works with no internet
- [ ] Tapping a row opens the detail with a back button; the detail shows the name, muscle and equipment pills, and numbered steps that are not cut off
- [ ] The detail has no History tab, Edit, Delete or load type
- [ ] The list takes a tap action as an option rather than hard-coding the navigation
- [ ] Colours, sizes and fonts come from the tokens; rows are at least 44 pt tall
- [ ] Type check and lint pass

## Notes
- Checked on a phone only in ticket 04.
