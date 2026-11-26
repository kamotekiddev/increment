Status: ready-for-agent

# Phase 3 · Feature 6 · Backup and restore

Part of Phase 3 (see `.scratch/phase-3/map.md`). Needs: feature 1 (the `isPro` gate). Grilled 2026-11-26 (owner decisions below). Designs on the canvas (https://claude.ai/artifact/Ny2LFGjeieuBmcCGHeGb7e): `DataBackup` (Your data, free state), `DataShare` (Backup ready), `DataRestore` (Welcome back, Phase 4). Needs one new frame: the **Restore from a backup** row on Your data, plus the Pro state of the Backup card (Create backup), the restore confirm and the error messages.

## Problem Statement

A lifter who gets a new phone loses every workout. The roadmap's Phase 3 gate says "a backup restores on a new phone", and nothing in the app can make or read a backup yet.

## Solution

Settings gets a **Your data** row that opens a Your data screen: a stats card (workouts, sets, records, and "Last backup" or "No backup yet"), a Backup card with **Create backup** (Pro) and a **Restore from a backup** row (free for everyone). Create backup builds one `.increment` file and hands it to the share sheet ("Backup ready"; on Android it also offers Save to a folder, decision 7). Restore picks a file, checks it all, shows what is inside and replaces the phone's training data in one step.

## Owner decisions (2026-11-26)

1. **Restore is free for everyone**, a row on Your data under the Backup card. A new phone starts Free and restores the purchase after the file (the "On your new phone" steps). Create backup stays Pro-only; a free lifter sees it locked and it opens the Paywall.
2. **The file leaves out `entitlements`**; restore never reads or writes it (ADR 0004: the store decides Pro). `unlock_screen_owed` goes with it.
3. **Finished workouts only.** A Workout in progress is never in the file. Restore is blocked while a Workout in progress exists on the phone ("Finish or discard your workout first").
4. **Validate everything first, then replace in one all-or-nothing step.** A file from a newer format version is refused ("This backup is from a newer Increment. Update the app to restore it."). A file that isn't an Increment backup, is cut off or breaks a rule (for example a set pointing at a workout not in the file) is refused ("This file isn't a valid Increment backup."). Nothing changes on a refusal or if the write fails. An older version is migrated up.
5. **Reminders restore as saved**, then the app re-plans them (`refreshReminders`). Restore never asks for notification permission; if it isn't granted the existing "Reminders denied" state shows.
6. **Plain JSON, no password.** File name `Increment backup 14 Nov 2026.increment`.
7. **"Last backup" updates only when the share sheet reports the share finished**; a cancel leaves "No backup yet" or the old date. **Android (owner decision 2026-11-26):** its share sheet has no "Save to device" and can't report an outcome, so Backup ready has a primary **Save to a folder** (system folder picker, file written there, a taken name becomes "... (2).increment") and a secondary **Share**. On Android Last backup is set only when the folder save succeeds; sharing never sets it; a cancelled pick changes nothing and shows no error; a failed write shows a plain error. iOS is unchanged. The date lives in the `settings` key/value table and is not in the file.
8. **Your data shows only what works**: stats card, Create backup, Restore from a backup. Automatic backups (feature 7) and CSV, PDF and Delete all data (feature 8) add their rows when built.
9. **After buying from the locked Create backup**, the lifter lands back on Your data with Create backup unlocked; nothing starts by itself.

## Implementation Notes

- **Format:** JSON with `format_version` (1), `exported_at`, the app version, and the rows of routines, routine_exercises, custom exercises (library rows are seeded, so only custom ones travel), finished workouts, workout_exercises, sets and `user_settings`. Every set carries `weight` and `weight_unit` (ADR 0003). Records are derived, never stored in the file.
- **Pure functions** (testable, no database): build the file from rows; validate and parse a file into rows (version check, shape check, foreign keys); the counts shown on Backup ready and on the restore preview.
- **Restore** replaces routines, workouts and their children, custom exercises and `user_settings`; keeps `entitlements`, the Last backup date and the seed version; resets ids safely and runs in one transaction.
- **Gate:** only Create backup reads the one Pro-gate place. Restore has no gate.
- **Libraries:** expo-file-system, expo-sharing, expo-document-picker (already in `docs/architecture.md`), installed with `npx expo install`; check the Expo SDK docs before use.
- **Out of scope:** Welcome back (Phase 4, reuses the same restore function), Automatic backups (feature 7), encryption, merging a backup into existing data.

## Testing

Round trip (build then parse gives the same rows); a kg and a lb set keep their unit; newer version, garbage, cut-off and a broken foreign key are refused with no change; restore blocked mid-workout; entitlement untouched; reminders re-planned; Last backup set only on a finished share; a hand-edited `is_pro` in the file does nothing.

## Further Notes

Tickets: `issues/01` to `issues/06`. Phone check: back up on one phone, restore on another, then Restore purchase.
