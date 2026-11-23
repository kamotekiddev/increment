# 06: Phone check and docs

**What to build:** Owner checks reminders on an iPhone and an Android phone, and the docs are updated.

**Blocked by:** 01, 02, 03, 04, 05

**Status:** ready-for-human

- [ ] Fresh install: turn reminders on, see the OS prompt once and allow. The card shows the time and the days from the Routines
- [ ] Set the time two minutes ahead on a planned day with the app in the background: the reminder arrives with the Routine name and the exercise count. Tap it and land on Today
- [ ] Start a workout before the reminder time: no reminder that day. Discard it before the time: the reminder comes back
- [ ] With the app open at the reminder time: nothing shows
- [ ] Change a Routine's days: the days note changes, and the new day gets a reminder
- [ ] Deny notifications (fresh install, or turn them off in the phone's Settings): the note shows, Open settings opens the app's page, and allowing them clears the note on return
- [ ] The rest-over alert still arrives during a workout
- [ ] `docs/screens.md` (the Settings row, plus the Reminder time sheet and the two note states), `docs/product.md` (the Settings list, and the onboarding permission paragraph now mentioning Settings), `docs/architecture.md` (the `user_settings` columns, the Reminders row) and `docs/decisions.md` (a Reminders entry) updated
- [ ] `.scratch/phase-2/map.md` marks feature 7 built, and Phase 2's gate goes to the owner
