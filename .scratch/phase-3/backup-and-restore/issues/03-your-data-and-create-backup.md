# 03: Your data and Create backup (Pro)

**What to build:** A Pro lifter opens Your data from Settings, sees what is stored, taps Create backup and shares the file.

**Blocked by:** 01, 02

**Status:** resolved

- [x] Settings has a Your data row that opens the screen.
- [x] The stats card shows workouts, sets and records, and "Last backup {date}" or "No backup yet".
- [x] Create backup builds the file, named "Increment backup {date}.increment", and opens Backup ready with its counts and the "On your new phone" steps.
- [x] Save or share file opens the share sheet.
- [x] "Last backup" updates only when the share sheet reports the share finished; a cancel changes nothing. The date is stored outside the file.
- [x] A backup taken during a Workout in progress leaves that workout out and the workout keeps running.
- [x] Only the rows that work are shown; no dead-end rows for features 7 and 8.
- [x] Type check, lint and tests pass.
