# 02: Record pills on Past workout

**What to build:** On Past workout, each exercise row that set records shows a short accent "New" pill per record at the right end of its name row, beside the Deload pill. See `../spec.md`.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Past workout reads the tags from the records module (the screen only renders them)
- [ ] One pill per tag (`Heaviest set`, `1-rep max`, `Most volume`, `Most reps in a set`, `Most reps in a workout`) in the accent-tint style; several wrap
- [ ] A row with no record shows no pill; a first workout of an exercise shows none
- [ ] The Deload pill stays; a switch of unit changes no pill
- [ ] Update `docs/screens.md` (Past workout row, remove "no records")
- [ ] Type check, lint and tests pass
