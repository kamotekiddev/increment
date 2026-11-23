Status: ready-for-agent

# Phase 2 · Feature 7 · Reminders

Part of Phase 2 (see `.scratch/phase-2/map.md`). Needs: feature 1 (Settings and units) and feature 3 (Workout settings, for the card it sits under). Decisions below come from a grilling session with the owner on 2026-11-23. The Settings card was previewed and approved the same day, then drawn on the design canvas.

## Problem Statement

The app never reminds the lifter to train. A lifter who plans Push day A for Monday and Thursday only finds out they forgot when they open the app on Friday. Reminders are listed in the product's Settings and in the roadmap for Phase 2, but nothing schedules them, and the only notification the app sends is the rest-over alert.

## Solution

A **Reminders** card in Settings, between the Workout card and the Data card, drawn on the design canvas as `SettingsReminders`, `SettingsReminderTime`, `SettingsRemindersNoDays` and `SettingsRemindersDenied` (row 6, Settings and data):

- **Training day reminders**: a switch, off by default.
- **Time**: shown only while the switch is on. A row with the time (`6:00 PM`) and a chevron that opens a sheet titled "Reminder time" ("The same time on every training day.") with the phone's own hour:minute picker, **Save** and **Cancel**. Default 6:00 PM.
- **A note under them**:
  - normally the reminder days, `Mon, Tue, Thu, Fri · from your Routines' days`
  - `No training days yet. Set days on a Routine.` when no Routine has days
  - `Notifications are off for Increment.` with an **Open settings** link when the phone blocks notifications

With the switch on, the app sends a local notification at that time on every day on which at least one Routine is planned. A day on which a Workout has already been started gets none. The days follow the Routines' days, with no separate day picker. The notification reads `Push day A today` / `5 exercises planned`. Tapping it opens the app on Today.

## User Stories

**Turning reminders on**
1. As a lifter, I want a Training day reminders switch in Settings, so that I can get a nudge on the days I planned to train.
2. As a lifter, I want reminders off on a fresh install, so that the app never asks for notification permission before I choose to use them.
3. As a lifter, I want the phone's permission prompt the first time I turn reminders on, if the app has never asked before, so that I see why it is asked.
4. As a lifter, I want the switch to turn on only once I allow notifications, so that it never looks on while nothing can fire.
5. As a lifter who said no to notifications (here or at the first rest), I want the switch to stay off and a note saying "Notifications are off for Increment." with an Open settings link, so that I know how to fix it. The app never shows the prompt again.
6. As a lifter, I want Open settings to open Increment's page in the phone's Settings app, so that I can allow notifications in one step.
7. As a lifter who turns notifications off in the phone's Settings while reminders are on, I want the switch to stay on and the same note to show, so that reminders come back by themselves once I allow notifications again, without touching the switch.
8. As a lifter, I want turning the switch off to cancel every scheduled reminder at once, so that nothing fires afterwards.

**When they fire**
9. As a lifter, I want a reminder only on days on which at least one of my Routines is planned, so that I am never nudged on a Rest day.
10. As a lifter, I want the reminder days to follow my Routines' days, so that adding Saturday to Push day A adds a Saturday reminder without a trip to Settings.
11. As a lifter, I want Settings to list the reminder days ("Mon, Tue, Thu, Fri"), Sunday first like every other day row, so that I can see when I'll be reminded.
12. As a lifter with no Routine days set, I want the note "No training days yet. Set days on a Routine." with the switch still usable, so that reminders begin as soon as I plan a day.
13. As a lifter, I want one time for every reminder day, 6:00 PM by default, so that the setting stays one row.
14. As a lifter, I want to change the time in a sheet with the phone's own time picker, with Save and Cancel, so that it works like every other time picker on my phone. Cancel or swiping down changes nothing.
15. As a lifter who trained before the reminder time, I want no reminder that day, so that I am not told to do a workout I already did.
16. As a lifter with a Workout in progress at the reminder time, I want no reminder, so that I am not nudged in the middle of a set.
17. As a lifter with two Routines planned on one day, I want any Workout started that day to cancel that day's reminder, whichever Routine it was.
18. As a lifter who discards a Workout before the reminder time, I want that day's reminder back, so that a discard counts as not having trained.
19. As a lifter, I want reminders to keep coming for 4 weeks without opening the app, so that a short break still gets nudges.

**What it says and does**
20. As a lifter, I want the reminder to read "Push day A today" with "5 exercises planned" under it, so that I know what's planned at a glance.
21. As a lifter with two or more Routines planned that day, I want "Push day A and Legs today" with "2 workouts planned" (three or more: "A, B and C today"), so that one reminder covers the day.
22. As a lifter, I want tapping the reminder to open the app on Today, so that the day's Routine and its Start button are right there.
23. As a lifter, I want no banner if the reminder time comes while I'm already in the app, so that it doesn't interrupt me.
24. As a lifter, I want the rest-over alert to work as before, so that adding reminders changes nothing during a workout.

## Implementation Decisions

- **Storage:** two not-null columns on the single-row `user_settings` table in one migration (0011): reminders on (boolean, default false) and reminder time as minutes after local midnight (integer, default 1080 = 6:00 PM). The read clamps the time to 0 to 1439, so a bad stored value is repaired on read, like Default rest. A hook per setting in the style of `useWorkoutSettings`, so no screen reads the table directly.
- **Planner (pure, no I/O):** given the Routines (name, days bitmask with Monday = bit 0, exercise count, in Routines-tab order), whether a Workout was started today, the reminder time and `now`, return the reminders for today and the next 27 days. Each has a stable id (`reminder-YYYY-MM-DD`), a local date-time, a title and a body. It returns nothing for a day with no planned Routine. It skips today when today's time has passed or a Workout was started today. Only today can already have a Workout, so that one flag is enough. Text:
  - Title: `<A> today`, `<A> and <B> today`, `<A>, <B> and <C> today`, in Routines-tab order.
  - Body with one Routine: `N exercises planned`, `1 exercise planned`, or `No exercises yet` for a Routine with none (it is still planned, as on Today).
  - Body with two or more Routines: `N workouts planned`.
- **Scheduler (I/O, thin):**
  - One `refreshReminders()` cancels every scheduled notification whose id starts with `reminder-`, then, when the setting is on and permission is granted, schedules the planner's output as date triggers.
  - Android gets its own `reminders` channel ("Training reminders", default importance), separate from the `rest` channel.
  - Calls are serialised so two refreshes never interleave (the same idea as the rest notification's generation counter). Every call is guarded, and a failure never breaks the screen that called it.
  - At most 28 reminders plus the one rest alert are pending, well under iOS's limit of 64.
- **When to refresh:**
  - app start, once the database is ready, and each time the app returns to the foreground. This catches a permission change, a time zone change and the rolling 4-week window.
  - Start workout (cancels today's) and Discard workout (can bring today's back).
  - Routine create, delete, rename, days change, and exercises added or removed.
  - the switch and the time changing.
  - Finishing a Workout needs no refresh, because Start already cancelled today.
- **Permission:** move the rest timer's one-time ask (`ensurePermission` and `shouldAskPermission` in `src/workout/restNotification*.ts`) into one shared notifications module that both the rest timer and reminders use. Then a denial anywhere is never asked again, and an ask in Settings means the first rest never prompts.
  - Turning the switch on reads the status. If it is undetermined, it asks. Granted saves on and refreshes. Denied leaves the switch off and shows the note.
  - The note shows when the setting is on and permission is not granted, or after a denied tap on that visit to Settings (screen state, not stored).
  - Open settings uses React Native's `Linking.openSettings()`.
  - Settings re-reads the permission when the app returns to the foreground.
- **Foreground and tap:** the global handler set by `setupRestNotifications()` stays as it is (no banner, list or sound while the app is open), which also covers reminders. A tap on a notification whose id starts with `reminder-` routes to Today (the tabs index), unless the live workout screen is open, in which case it does nothing. On a cold start Today is already the first screen, and crash resume keeps priority as today. Check the SDK 58 `expo-notifications` docs for the current response-listener API before writing it.
- **Days note:** three-letter day names Sunday first (the app's week order) joined with ", ", or `Every day` for all seven. It is worked out from the Routines with the helpers in `src/routines/routineDays.ts`.
- **Time display:** the Time row shows the time in the phone's own 12- or 24-hour format. The sheet uses `@expo/ui`'s native date picker in hour-and-minute mode (check the SDK 58 docs for its props). Save writes the time and refreshes. Cancel and swipe-down write nothing.
- **Android timing:** reminders do not need to be exact to the minute, so no exact-alarm permission is requested. A reminder a few minutes late is acceptable. This is separate from the open question about the rest-over alert in `docs/decisions.md`.
- **Settings screen:** a `ReminderCard` component in `src/settings/`, placed between `WorkoutCard` and the Data card, built from the design tokens like `WorkoutCard`. No Pro badge (reminders are free).
- **Docs in the same change:**
  - `docs/screens.md`: the Settings row, plus rows for the Reminder time sheet and the two note states.
  - `docs/product.md`: the Settings list, and the permission paragraph under Onboarding, which now says Settings asks too.
  - `docs/architecture.md`: the `user_settings` columns, and the Reminders row of the stack table.
  - `docs/decisions.md`: a Reminders entry.
  - `.scratch/phase-2/map.md`: feature 7 marked built.
  - `GLOSSARY.md` already has **Reminder**.
- **No ADR.** All of it is easy to change later. The 4-week window and one time for every day are product choices recorded in `docs/decisions.md`.

## Testing Decisions

A good test checks behaviour through a module's interface (what reminders would be scheduled and what they say), not how they are stored or handed to the OS.

- **Planner (Jest, the main seam)**, with a fixed `now` and local dates:
  - Push day A Mon/Thu and Pull day B Tue/Fri at 6:00 PM, `now` Sunday noon: 16 reminders over 28 days, on Mon, Tue, Thu and Fri only, each at 18:00 local.
  - Today planned, `now` 17:59, no Workout: today is included. `now` 18:00 or later: today is skipped. Workout started today: today is skipped, and the rest of the window is unchanged.
  - Two Routines the same day: one reminder titled `Push day A and Legs today` with `2 workouts planned`. Three: `A, B and C today`.
  - Body counts: `5 exercises planned`, `1 exercise planned`, `No exercises yet`.
  - No Routine days: no reminders.
  - The ids are stable (`reminder-YYYY-MM-DD`), and a date across a DST change keeps its local wall-clock time.
- **Days note text:** `Mon, Tue, Thu, Fri`, Sunday first when Sunday is planned, `Every day` for all seven, and the no-days line.
- **Settings read and write:** a fresh database reads off and 1080, a write reads back, a stored 2000 clamps to 1439, and a write touches no other column.
- **Permission decision:** extend the existing `shouldAskPermission` test where it moves. Add a pure "what does the switch do" function (undetermined → ask, granted → on, denied → stay off and show the note).
- **Not unit-tested:** the `expo-notifications` calls, the sheet and the card layout (owner check).
- **Owner check on a phone** (last ticket):
  - Turn reminders on from a fresh install and see the prompt once.
  - Set the time two minutes ahead on a planned day and see the reminder with the Routine name, then tap it and land on Today.
  - Start a workout before the time and see no reminder.
  - Deny notifications and see the note, and confirm Open settings opens the app's page.
  - Allow them again and see the note go away on return.
  - Confirm the rest-over alert still works during a workout.
- Prior art: `src/workout/restNotificationText.test.ts`, `src/settings/workoutSetting.test.ts`, `src/routines/routineDays.test.ts`, `src/today/todayState.test.ts` (Routine days and Rest day).

## Out of Scope

- The onboarding Reminders screen (Phase 4). Its "Remind me at" chips stay on the canvas for onboarding only.
- A line about Targets or Earned steps in the reminder (`Bench press is ready to go up to 62.5 kg.` from the onboarding mockup). It would be scheduled up to 4 weeks ahead and go stale, and it needs the engine and unit rules in the scheduler. Phase 4 polish at the earliest.
- A different time per weekday or per Routine.
- A day picker separate from the Routines' days, and reminders on Rest days.
- Snooze, a sound choice, or more than one reminder a day.
- Asking for the Android exact-alarm permission.
- Light/dark theme (still open, see the map).

## Further Notes

- The canvas's `Settings` artboard is unchanged. It still shows the screen without the Reminders card, and its Appearance card is not built. The four new artboards show the card in place, scrolled past the Units card.
- `Training day reminders` was chosen over a bare `Reminders` so the switch says what it reminds about, since the card is already titled Reminders.
