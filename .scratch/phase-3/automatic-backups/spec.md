Status: ready-for-agent

# Phase 3 · Feature 7 · Automatic backups

Part of Phase 3 (see `.scratch/phase-3/map.md`). Needs: feature 6 (the backup file, `last_backup_at`, the Your data screen) and feature 1 (the `isPro` gate). Grilled 2026-11-26 (owner decisions below). Designs on the canvas (https://claude.ai/artifact/Ny2LFGjeieuBmcCGHeGb7e): `DataAuto` (Automatic backups), `ProUnlocked` (its "Turn on automatic backups" card). `DataBackupPro` shows the "Automatic backups (feature 7)" placeholder row this feature replaces.

## Problem Statement

A Pro lifter can make a backup by hand, but a backup nobody remembers to make doesn't exist on the day the phone is lost.

## Solution

An **Automatic backups** screen, opened from a row on Your data: a Pro switch, "Last backup" with **Back up now**, **How often** (After every workout, Every day, Every week, Every month), **Where to save** (Folder, Keep). The app writes a `.increment` file by itself when one is due and keeps the last N.

## Owner decisions (2026-11-26)

1. **iOS saves to the app's own folder** (`Documents/`, visible in Files › On My iPhone › Increment; `app.json` sets `UIFileSharingEnabled` and `LSSupportsOpeningDocumentsInPlace`). No iCloud Drive, no new dependency. The mockup's "iCloud Drive › Increment" row reads "On this iPhone › Increment" and is read-only. **Android** saves to a folder the lifter picks (system folder picker, permission kept across launches).
2. **After every workout** writes when the workout is finished (after the summary closes), and the open-time check catches up if that write failed. Daily, weekly and monthly are checked when the app opens (no background task).
3. **Rolling interval:** daily, weekly and monthly are due when the last backup is 1, 7 or 30 days old **and** the data changed. Captions: "Once a day, if anything changed", "Once a week, if anything changed", "Once a month, if anything changed". After every workout always counts as a change.
4. **One "Last backup" date** (`last_backup_at`) for manual and automatic backups. A manual backup also restarts the interval.
5. **"Changed" is a content fingerprint:** build the backup text without `exported_at`, fingerprint it, compare with `last_backup_hash` (key in the `settings` table, no migration). Set only when a backup is written.
6. **Own file name** `Increment auto backup 14 Nov 2026 18-42.increment`. Pruning deletes only files in the folder with that prefix, oldest beyond Keep. Manual backups and any other file are never touched.
7. **Keep: Last 3 / 5 / 10 / 20, default 5**, picked in a tick-sheet (same pattern as the chart range sheet). Default frequency: After every workout.
8. **Failure:** one alert per failure streak ("Automatic backup couldn't save. Your last backup was {date}." Fix it / Later; Fix it opens the screen) plus a status line on the screen ("Last backup {date} · Couldn't save: folder unavailable"). It repeats only after a success then a new failure. It never blocks Finish or launch. Retries quietly at each later trigger.
9. **Android first enable:** tapping the switch opens the folder picker at once. A chosen folder turns it on and writes the first backup; backing out leaves it off with no error. iOS turns on at once and writes the first backup.
10. **Back up now always writes** a new file (even if nothing changed), applies Keep, sets Last backup, and is disabled while a write runs. On Android with no folder it opens the picker first.
11. **Free lifter:** the row on Your data shows a grey Pro tag and opens the Paywall; after buying they land back on Your data. The screen is not shown to a free lifter.
12. **After a refund:** nothing runs and the row locks again; settings (switch, frequency, Keep, folder) and written files stay; buying Pro again resumes as before.
13. **Pro unlocked** gets the mockup's "Turn on automatic backups" card ("Recommended first step. Takes 10 seconds.") that opens the Automatic backups screen. Closes the "no card yet" note in `docs/screens.md`.
14. **The iOS database moves out of Documents** (owner decision 2026-11-26, option A). `app.json` shares `Documents` with Files, and expo-sqlite's default folder on iOS is `Documents/SQLite`, so Files would show the live database and let the lifter delete it. On iOS the database now opens in `Library/Application Support` (not shared); an existing `increment.db` (and its `-wal` and `-shm`) is moved there once, before it opens: only when the old one exists and the new one does not, never overwriting, copied and size-checked before the old files are deleted, and if the move fails the old location keeps being used. Android is unchanged. Backups stay in `Documents` and are the only thing Files shows.

## Implementation Notes

- **Pure module** (no I/O, testable): `isBackupDue(frequency, lastBackupAt, now, changed)`, the auto file name, the prune list from a folder listing, the fingerprint, the status line text. Next to `src/backup/backupText.ts`.
- **Reuses** `createBackup` / `backupFileName` (`src/backup/backupQueries.ts`, `backupFile.ts`), `readLastBackup` and the `last_backup_at` write, `uniqueFileName`, `saveBackupToFolder` internals (`src/backup/backupShare.ts`) and the single Pro gate (`src/backup/backupPro.ts`, `useIsPro`).
- **Settings** (`settings` key/value, no migration): switch, frequency, keep count, Android folder URI, `last_backup_hash`, failure-streak flag.
- **Triggers:** after Finish and after the summary closes; app open and return to the app; Back up now. All call one function that never throws and returns saved / failed / skipped.
- **Pro unlocked over a live workout** keeps its own rule (owed); the automatic write does not wait for it, but it never runs while a workout summary is open.
- **Out of scope:** iCloud Drive, background tasks, Google Drive API, encryption, restoring from the folder (Restore on Your data already picks a file), changing the folder's files by hand.
- Check the Expo SDK 58 docs for `expo-file-system` before writing (docs/agents/rules/code.md).

## Testing

Due rule per frequency (just under and at the interval, unchanged data, never backed up, manual backup restarts it); fingerprint ignores `exported_at` and changes with a set; prune keeps N newest `Increment auto backup` files and leaves a manual file and a stranger untouched; name collision gets "(2)"; failure sets the streak flag once and success clears it; refund pauses without clearing settings; free lifter never writes. Phone check: Android folder permission survives an app restart; iOS file appears in Files.

## Further Notes

Tickets: `issues/01` to `issues/06`.
