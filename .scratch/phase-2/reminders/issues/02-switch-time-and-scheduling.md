# 02: Reminders switch, time and scheduling

**What to build:** The Reminders card in Settings, between Workout and Data, as drawn on the canvas (`SettingsReminders`, `SettingsReminderTime`, `SettingsRemindersNoDays`). The lifter turns Training day reminders on, allows notifications, picks a time, and the next 4 weeks of reminders are scheduled with the OS.

**Blocked by:** 01

**Status:** built

- [x] Migration 0011 adds two not-null `user_settings` columns: reminders on (default false) and reminder time in minutes (default 1080). The read clamps the time to 0 to 1439. A hook per setting, like `useWorkoutSettings`
- [x] The rest timer's one-time ask (`ensurePermission`, `shouldAskPermission`) moves into one shared notifications module used by both the rest timer and reminders. The rest timer behaves exactly as before
- [x] `ReminderCard` in `src/settings/`, on the design tokens, with no Pro badge:
  - a `Training day reminders` switch
  - while on, a `Time` row with the time in the phone's 12- or 24-hour format and a chevron
  - while on, the days note (`Mon, Tue, Thu, Fri · from your Routines' days`, or `No training days yet. Set days on a Routine.`)
- [x] Switch on: undetermined permission shows the OS prompt. Granted saves on and schedules. Denied leaves the switch off (ticket 03 adds the note). Switch off cancels every reminder
- [x] The Time row opens a sheet titled `Reminder time` ("The same time on every training day.") with `@expo/ui`'s native picker in hour-and-minute mode (check the SDK 58 docs). Save writes and reschedules. Cancel and swipe-down write nothing
- [x] `refreshReminders()`:
  - cancels every scheduled notification whose id starts with `reminder-`
  - when the setting is on and permission is granted, schedules the planner's output as date triggers on a new Android channel `reminders` ("Training reminders", default importance)
  - is serialised and guarded, so a failure never breaks the caller
  - runs at app start (once the database is ready), when the app returns to the foreground, and when the switch or time changes
- [x] The foreground handler stays as it is (no banner while the app is open). The rest-over alert is unchanged
- [x] Jest: a fresh database reads off and 1080, a write reads back and touches no other column, and a stored 2000 clamps to 1439. The moved `shouldAskPermission` test still passes
- [x] Type check, lint and tests pass
