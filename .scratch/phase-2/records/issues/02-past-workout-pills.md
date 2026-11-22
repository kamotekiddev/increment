# 02: Record pills on Past workout

**What to build:** On Past workout, each exercise row that set records shows a short accent "New" pill per record at the right end of its name row, beside the Deload pill. See `../spec.md`.

**Blocked by:** 01

**Status:** built

- [x] Past workout reads the tags from the records module (the screen only renders them)
- [x] One pill per tag (`Heaviest set`, `1-rep max`, `Most volume`, `Most reps in a set`, `Most reps in a workout`) in the accent-tint style; several wrap
- [x] A row with no record shows no pill; a first workout of an exercise shows none
- [x] The Deload pill stays; a switch of unit changes no pill
- [x] Update `docs/screens.md` (Past workout row, remove "no records")
- [x] Type check, lint and tests pass
