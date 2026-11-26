# 02: Turn on automatic backups and Back up now

**What to build:** A Pro lifter opens the Automatic backups row on Your data and turns the switch on. On Android the folder picker opens first (backing out leaves it off, no error); on iOS it turns on at once. A file named `Increment auto backup {date} {HH-mm}.increment` is written, Last backup updates, and Back up now writes another. Keep (3 / 5 / 10 / 20, default 5) prunes only auto-prefixed files. A free lifter sees a locked row with a Pro tag that opens the Paywall and lands back on Your data.

**Blocked by:** 01

**Status:** resolved

- [x] Pure, unit-tested: auto file name (unique within a folder listing), prune list (oldest beyond Keep, only the auto prefix, a manual file and a stranger untouched).
- [x] iOS writes to the app Documents folder (`app.json` sets `UIFileSharingEnabled` and `LSSupportsOpeningDocumentsInPlace`); Android writes to the stored picked folder; a missing or revoked folder is a failure result, never a throw.
- [x] A write sets `last_backup_at` (shared with manual backups) and `last_backup_hash`, then prunes.
- [x] Back up now always writes, is disabled while writing, and opens the picker first on Android with no folder.
- [x] Settings stored in the `settings` table, no migration.
- [x] Type check, lint and tests pass.
