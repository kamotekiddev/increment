# 05: Restore from a backup

**What to build:** Any lifter, Free or Pro, picks a backup file on Your data, sees what is inside, confirms, and the phone's training data is replaced.

**Blocked by:** 01, 02, 03

**Status:** resolved

- [x] A "Restore from a backup" row is open for everyone, with no Pro check.
- [x] The lifter picks a file, sees its name and counts and the warning that restoring replaces the training data on this phone, and confirms.
- [x] The replace is one all-or-nothing step; if it fails, the old data is still there.
- [x] Restore is blocked while a Workout in progress exists ("Finish or discard your workout first").
- [x] A newer-version file and an invalid file are refused with their plain messages, and nothing changes.
- [x] The Pro entitlement and the Last backup date are untouched; a Free phone stays Free until Restore purchase.
- [x] Reminders are re-planned after restore without asking for permission; if it isn't granted the "Reminders denied" state shows.
- [x] Restoring a backup made on another phone shows the workouts, routines, custom exercises and settings, and records and targets are derived from them.
- [x] Type check, lint and tests pass.
