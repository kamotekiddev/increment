# 03: Scheduled backups

**What to build:** The lifter picks a frequency (default After every workout). After every workout writes when the workout is finished (summary closed). Every frequency is checked at app open and on return to the app. Daily, weekly and monthly are due at a rolling 1 / 7 / 30 days since the last backup and only if the content fingerprint changed. A manual backup restarts the interval.

**Blocked by:** 02

**Status:** resolved

- [x] Pure, unit-tested: `isBackupDue` (just under and at the interval, unchanged data, never backed up), fingerprint ignores `exported_at` and changes with a set.
- [x] Frequency radios on the screen with the "if anything changed" captions.
- [x] Never runs for a free lifter or while a workout summary is open; never blocks Finish or launch.
- [x] Type check, lint and tests pass.
