# 04: Rest-over notification and permission

**What to build:** A local notification when a rest ends while the app is in the background, and the one-time permission prompt the first time a rest starts.

**Blocked by:** 02

**Status:** built

- [x] `expo-notifications` added with `npx expo install` after checking the SDK 58 docs; config plugin added to `app.json` with `enableRemoteNotifications: false`; an Android channel for rest alerts
- [x] A `TIME_INTERVAL` notification is scheduled when a rest starts, with the "Next up" text, and cancelled or rescheduled on Skip, replace, unmark, ±15s, Finish and Discard
- [x] Permission is requested once, only when the status is undetermined, the first time a rest starts; the timer starts either way, and a denial is never asked again
- [x] While the app is open no banner or sound shows; the buzz from ticket 03 is the only nudge
- [x] With permission denied the timer behaves exactly as in tickets 02 and 03
- [x] Nothing here makes a network call
- [x] Type check, lint and tests pass
