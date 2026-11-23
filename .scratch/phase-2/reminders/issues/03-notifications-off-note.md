# 03: Notifications off note and Open settings

**What to build:** When the phone blocks Increment's notifications, the Reminders card says so and links to the phone's Settings, as drawn on the canvas (`SettingsRemindersDenied`). The app never shows the permission prompt a second time.

**Blocked by:** 02

**Status:** built

- [x] A pure "what the switch does" function: undetermined → ask, granted → turn on, denied → stay off and show the note. The card uses it
- [x] Tapping the switch on while permission is denied (here or at the first rest) shows no prompt. The switch stays off and the note appears: `Notifications are off for Increment.` with an `Open settings` link. This is screen state only, not stored
- [x] With the setting on and permission revoked later in the phone's Settings, the switch stays on and the same note replaces the days note. Nothing is scheduled while blocked
- [x] `Open settings` calls `Linking.openSettings()`
- [x] On return to the app, Settings re-reads the permission. Once it is allowed, the note goes away and `refreshReminders()` schedules again without touching the switch
- [x] Jest: the switch decision function for the three statuses
- [x] Type check, lint and tests pass
