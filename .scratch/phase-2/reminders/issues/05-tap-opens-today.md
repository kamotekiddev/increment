# 05: Tapping a reminder opens Today

**What to build:** Tapping a reminder brings the lifter to Today, where the day's Routine and its Start button are on top.

**Blocked by:** 02

**Status:** built

- [x] A notification response listener (check the SDK 58 `expo-notifications` docs for the current API) handles only ids starting with `reminder-`. The rest-over alert's tap behaves as before
- [x] App in the background: the tap routes to Today (the tabs index)
- [x] Live workout screen open: the tap does nothing
- [x] Cold start from the tap: Today is the first screen as now, and crash resume of a Workout in progress keeps priority
- [x] Type check, lint and tests pass
