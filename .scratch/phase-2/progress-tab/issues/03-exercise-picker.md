# 03: Exercise picker and the remembered pick

**What to build:** The picker pill opens a bottom sheet listing the exercises in any routine plus every exercise with a finished workout, one entry per library exercise (a weighted twin is its own), most recently done first, then routine-only ones. Each row shows the equipment icon, the name, "Thu, 12 Nov" or "Not done yet", and a tick on the selected one; a search field shows only above 8 exercises. Tapping a row selects it and closes the sheet. The pick is kept in memory across tab switches, not across an app restart, and is cleared when a workout is finished so Progress opens on the default exercise again. See `../spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Picker list order, one entry per exercise, "Not done yet" for never-done ones; discarded and open workouts do not make an exercise done
- [ ] Search appears only when the list has more than 8 exercises
- [ ] The pick survives a tab switch and is dropped on an app restart
- [ ] Finishing a workout clears the pick
- [ ] Tests at the Progress read module cover the picker list and ordering
- [ ] Type check, lint and tests pass
