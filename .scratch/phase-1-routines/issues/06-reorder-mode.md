# 06: Reorder mode

**What to build:** A Reorder button on Edit routine switches to reorder mode: ▲ ▼ on each row, Done and Cancel in the header, tap-to-edit and ⋯ hidden. Done saves the order and renumbers positions; Cancel discards.

**Blocked by:** 04

**Status:** built; checked by tsc, lint and Jest only

- [ ] First row cannot move up and last cannot move down
- [ ] Cancel leaves the saved order unchanged
- [ ] Order survives closing the app after Done
