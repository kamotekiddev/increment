# 01: Save edited marks and the rest timer, reopen after a kill

**What to build:** The whole feature in one slice, see the spec.

**Blocked by:** None

**Status:** built, owner phone check pending (ticket 02)

- [x] Migration adds the edited mark, last edited time and rest timer columns
- [x] Edited mark saved and read back, including when the typed value did not change
- [x] Rest timer saved on every change, restored when still running, dropped silently when over
- [x] Cold launch opens the workout when the last edit was within 12 hours; backgrounding does not
- [x] Workout opens on the first exercise with an open set
- [x] Pure rules tested; type check, lint and tests pass
