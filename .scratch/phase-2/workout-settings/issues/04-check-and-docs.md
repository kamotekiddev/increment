# 04: Phone check and docs

**What to build:** Owner checks the three settings on an iPhone and an Android phone, and the docs and mockup are updated.

**Blocked by:** 01, 02, 03

**Status:** ready-for-human

- [ ] Change Default rest to 2:00, add an exercise to a Routine: it starts at 2:00; the exercises already in that Routine keep their rest
- [ ] Switch Show previous set off: the live workout has no Last column (weighted and bodyweight), the Target banner and prefilled values stay; switch it on: the column returns
- [ ] Start a workout and leave the phone untouched past its auto-lock time: the screen stays lit, including during a rest; finish the workout: the screen locks normally again. Switch Keep screen awake off and repeat: it locks
- [ ] Close and reopen the app: all three settings are kept
- [ ] `docs/screens.md` (Settings row, live workout Last column), `docs/product.md` (Settings list, the "screen stay-awake" not-yet line, new-exercise rest) and `docs/architecture.md` (`user_settings` columns) updated
- [ ] Mockup `Settings.dc.html`: the Default rest row redrawn with an inline − / + stepper instead of the chevron
- [ ] `.scratch/phase-2/map.md` marks feature 3 built
