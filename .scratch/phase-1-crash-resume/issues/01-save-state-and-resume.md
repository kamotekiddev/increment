# 01: Save edited marks, reopen after a kill

**What to build:** The whole feature in one slice, see the spec.

**Blocked by:** None

**Status:** built, owner phone check pending (ticket 02)

- [x] Migration adds the edited mark and last edited time
- [x] Edited mark saved and read back, including when the typed value did not change
- [x] Rest timer is not saved; the pre-kill "Rest over" alert is cancelled at app start
- [x] Cold launch opens the workout when the last edit was within 12 hours; backgrounding does not
- [x] Workout opens on the first exercise with an open set
- [x] Pure rules tested; type check, lint and tests pass
