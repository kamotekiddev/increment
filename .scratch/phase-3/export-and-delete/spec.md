Status: ready-for-agent

# Phase 3 · Feature 8 · Export and delete all data

Part of Phase 3 (see `.scratch/phase-3/map.md`). Needs: feature 1 (the `isPro` gate) and feature 6 (the Your data screen, Backup flow, `last_backup_at`). Grilled 2026-11-27 (owner decisions below). Designs on the canvas (https://claude.ai/artifact/Ny2LFGjeieuBmcCGHeGb7e): `DataExport` (Export progress), `DeleteAll` (the confirm sheet), `DataBackup` (free state, with the Export rows and the red Delete all data link). `DataBackupPro` still shows these as "Later" placeholders; this feature replaces them.

## Problem Statement

A lifter's history lives only on their phone. A Pro lifter who wants to look at it in a spreadsheet, or hand a coach a summary, has no way to. Any lifter who wants to leave, or start from zero, cannot clear what they logged without deleting the app.

## Solution

Two things on Your data. **Export your progress** (Pro): one row that opens the Export progress screen, where the lifter picks Spreadsheet (CSV, every done set) or PDF report (totals, Records and a chart per exercise), picks a time range, sees a preview and the count, and hands the file to the share sheet. **Delete all data** (free for everyone): a red row that opens a typed-confirmation sheet and removes everything the lifter made from the phone, leaving Pro and any saved backup files alone.

## Owner decisions (2026-11-27)

1. **Scope.** Only this feature is left to build in Phase 3. The plate calculator and warm-ups stay out. The phone checks of features 2, 3, 4, 6 and 7, and the Phase 3 gate check, stay with the owner.
2. **Weights in the CSV are as typed** (ADR 0003): a `weight` column, a `unit` column (kg or lb), and a `weight_kg` column to two decimals, so a lifter who logged in both units can sort. Nothing is rounded to a Jump. The mockup line "Weights export in kg, your current unit" is wrong and is replaced.
3. **CSV rows:** every **done** set from **finished** workouts, warm-ups included and marked in an `is_warmup` column. Skipped (not done) sets and any Workout in progress are left out. Columns also carry date, workout (routine) name, exercise, set number and reps.
4. **Time range** (30 days, 3 months, All time; default All time) applies to both formats, by workout date. The "Export N sets" button count and the preview follow it.
5. **PDF report contents:** a totals header (workouts, sets, date range), one records table (per exercise: best weight, est. 1RM, best volume, reps, date; the Records rules), and one **Weight over time** chart per exercise (Reps in a set for a bodyweight exercise), using the Progress chart's rules (one point per finished workout with a value, oldest first, skipped workouts never plotted as 0, a muted line under 2 points). No workout log; the CSV is for that. Built with `expo-print` from HTML.
6. **Entry point:** Your data gets one "Export your progress" row with a Pro tag. It opens the Export progress screen with Spreadsheet ticked; the format picker on that screen switches to PDF. A free lifter sees the same row locked; it opens the Paywall and, after buying, lands back on Your data (the Backup pattern). The mockup's two separate rows (Spreadsheet, PDF report) become this one row.
7. **Delete all data removes:** Workouts and their sets, Routines, Custom exercises, and resets preferences to defaults (kg, 90 s default rest, show previous set on, keep screen awake on, reminders off with the planned notifications cancelled). Automatic backups switch off, and Last backup and the backup fingerprint are cleared ("No backup yet"). **It keeps** the Pro entitlement (Pro is never reset; closes the open item in `map.md`), the seeded library exercises and any Backup file already saved, manual or automatic. It is free for everyone.
8. **Blocked while a Workout is in progress.** The message is "Finish or discard your workout first." and nothing changes. The check runs when Delete all data is opened, before the typed confirmation, so the lifter never types DELETE to be refused.
9. **The delete sheet's backup shortcut** ("Create a backup first", Pro tag) shows for Pro lifters only. It opens the existing Backup flow and returns the lifter to Your data. A free lifter doesn't see the row, so the sheet never turns into a Paywall. Restore from a backup stays free.
10. **Landing:** the sheet closes and the lifter stays on Your data. The stats card reads 0 workouts, 0 sets, 0 records and "No backup yet", with a short "All your data was deleted." message. Whether Delete all data re-opens onboarding is a Phase 4 open item.
11. **Typed confirmation** is the word DELETE (the mockup's field), compared ignoring case and surrounding spaces. The red **Delete everything** button is disabled until it matches. The sheet shows the counts it will remove, and "Your Pro purchase isn't affected."
12. **Refund:** Export locks again for a free lifter (row opens the Paywall); Delete all data is unaffected. Anything already exported or saved stays with the lifter.
13. **No ADR.** Reversible, nothing stored, no schema change.
14. **Your data was redesigned** (owner decision 2026-11-27, option A of three prototypes): a stats card with a "Backed up 26 Nov" or "No backup yet" pill; a **Back up** card (Create backup, then Automatic backups); a **Restore and export** card (Restore from a backup, Export your progress); and Delete all data as its own red row. Every row is one shared shape, and Create backup is the only filled button. See `docs/decisions.md`, "Your data layout".

## User Stories

1. As a Pro lifter, I want to export every set I've logged to a spreadsheet, so that I can sort, filter and chart my training in Excel or Google Sheets.
2. As a Pro lifter, I want each row to show the weight as I typed it with its unit, so that nothing I logged is changed or rounded.
3. As a Pro lifter who logged some sets in kg and some in lb, I want an extra kg column, so that I can sort and sum my weights in one unit.
4. As a Pro lifter, I want warm-ups marked in their own column, so that I can filter them out.
5. As a Pro lifter, I want sets I skipped left out of the export, so that the file shows only what I did.
6. As a Pro lifter, I want a workout I haven't finished left out, so that a half-logged session never appears in my history.
7. As a Pro lifter, I want to pick the last 30 days, the last 3 months or all time, so that I can export only the period I need.
8. As a Pro lifter, I want the button to say how many sets will be exported and a preview of the first rows, so that I know what I'm about to share.
9. As a Pro lifter, I want to switch between a spreadsheet and a PDF report on the same screen, so that I don't go back to pick again.
10. As a Pro lifter, I want a PDF report with my totals, my records and a chart per exercise, so that I can show a coach where I am.
11. As a Pro lifter, I want a bodyweight exercise charted in reps, so that the report makes sense for pull-ups.
12. As a Pro lifter, I want an exercise with fewer than 2 points to say so instead of drawing an empty chart, so that the report never looks broken.
13. As a Pro lifter, I want the file handed to the share sheet, so that I can save it, email it or send it to a coach.
14. As a Pro lifter with no finished workouts in the range, I want to be told there is nothing to export, so that I don't share an empty file.
15. As a free lifter, I want the Export row visible with a Pro tag, so that I know the feature exists.
16. As a free lifter, I want tapping Export to open the Paywall and bring me back to Your data after I buy, so that I can continue where I was.
17. As a lifter whose Pro was refunded, I want everything I already exported to stay mine, and the row to lock again, so that a refund never costs me anything I made.
18. As any lifter, I want a Delete all data link on Your data, so that I can clear everything I logged without deleting the app.
19. As any lifter, I want to type DELETE before it works, so that I can't delete my history by accident.
20. As any lifter, I want the sheet to say how many workouts, sets, routines and records will go, so that I know what I'm giving up.
21. As any lifter, I want my Pro purchase left alone, so that deleting my data never costs me what I paid for.
22. As any lifter, I want my preferences reset and reminders cancelled, so that the app starts clean and doesn't nudge me about routines that no longer exist.
23. As a lifter with automatic backups on, I want them switched off and "No backup yet" shown, so that the app doesn't back up an empty phone over my last good file.
24. As any lifter, I want backup files I already saved to stay, so that I can still restore after a mistake.
25. As a Pro lifter, I want a "Create a backup first" shortcut in the delete sheet, so that I can save my data before it goes.
26. As a free lifter, I don't want the delete sheet to push me to the Paywall, so that clearing my own data never feels like an upsell.
27. As any lifter in the middle of a workout, I want Delete all data to tell me to finish or discard it first, so that my live workout is never deleted underneath me.
28. As any lifter, I want to be told this before I type the confirmation, so that I'm not made to type it only to be refused.
29. As any lifter, I want to land back on Your data showing zeros and "No backup yet", so that I can see it worked.
30. As any lifter, I want Restore from a backup to stay one tap away after a delete, so that I can bring everything back if I change my mind.

## Implementation Decisions

- **Export build** is one pure module over the database: given a time range and "now", it returns the rows for the CSV, the CSV text (with correct quoting of commas, quotes and line breaks in names), the set count for the button, a short preview, and the PDF's data model (totals, records table, per-exercise chart points). Both formats read from the same finished-workout, done-set selection, so the counts always agree. It reuses the Records rules and the Progress chart's point rules; it invents none.
- **PDF** is an HTML string built from the PDF data model and handed to `expo-print`; the chart is inline SVG drawn with the same geometry helper as the Progress chart. The Pro gate is read through the existing single gate. Check the Expo SDK docs for `expo-print` and `expo-sharing` before writing; add `expo-print` with `npx expo install`.
- **File names:** `Increment export {date}.csv` and `Increment report {date}.pdf`, never colliding with a `.increment` backup.
- **Export screen:** format radio (Spreadsheet, PDF report), Time range segmented control, Preview card (first 3 rows for CSV; a one-line summary for PDF), a note that this is a copy for reading and not a backup that restores, and a bottom button "Export N sets" that hands the file to the share sheet. A Export with zero sets is disabled with "No sets in this range."
- **Your data:** the "Later" placeholder rows for Spreadsheet, PDF report and Delete all data are replaced by the one Export row (Pro tag when free, locked, opening the Paywall) and a red Delete all data row below (a redesign on 2026-11-27 made it a row, see decision 14).
- **Delete all data** is one transaction over the database: delete children first (sets, workout exercises, workouts, routine exercises, routines, custom exercises), reset the `user_settings` row to its defaults, clear the automatic backup settings, `last_backup_at` and `last_backup_hash`, and leave `entitlements`, the seeded library and the `seed_version` flag alone. It returns "workout-in-progress" and changes nothing if one exists (the same check Restore uses). After a success the caller cancels the planned reminders and refreshes the stores that show data; it never deletes files on disk.
- **Confirm sheet:** the shortcut row only for Pro; the typed field and Delete everything button; Cancel. The counts come from the same stats query Your data already uses.
- **No schema change, no migration.**
- **Out of scope for the glossary:** `GLOSSARY.md` already has **Export** and **Delete all data**.

## Testing Decisions

- A good test checks external behavior only: the text a lifter would get, or the rows left in the database. Never the internals of how the query is written.
- **Seam 1, the export build** (test database): finished-only and done-only selection (a skipped set, an unfinished workout and a Workout in progress are all left out); warm-ups present and marked; `weight` as typed, `unit` and `weight_kg` for a 135 lb row and a 60 kg row; range boundaries (a set exactly 30 days old, inside and outside the range); CSV quoting of a name with a comma and a quote; set count equals row count; an empty range gives zero rows; the PDF data model's chart points skip a workout with no value and mark an exercise with under 2 points; a bodyweight exercise uses reps. Prior art: `allRecordsQueries.test.ts`, `backupQueries.test.ts`.
- **Seam 2, Delete all data** (test database filled by the same `phone()` style helper as Restore): everything training-related is gone; preferences are the defaults; automatic backup settings, `last_backup_at` and `last_backup_hash` are cleared; the `entitlements` row, library exercises and `seed_version` are untouched; a Workout in progress returns "workout-in-progress" and changes nothing; running it twice is safe. Prior art: `restoreBackup.test.ts`.
- **Seam 3, the Pro gate:** a free lifter's Export row routes to the Paywall; the sheet's backup shortcut is hidden for a free lifter and shown for a Pro one; a refund locks Export again. Prior art: `backupPro.test.ts`, `proTap.test.ts`.
- **Phone check (not unit tests):** the share sheet on both OSes with the CSV opened in a spreadsheet; the PDF renders on a real phone, charts included, with page breaks that don't cut a chart; Delete all data on a phone with a Pro purchase, auto backups on and files in Files, then Restore from a backup.

## Out of Scope

- A workout log in the PDF, a custom date-range picker, picking which exercises to export, a password on the file, exporting to a cloud service, and a re-import from CSV.
- Re-opening onboarding after Delete all data (Phase 4).
- Deleting backup files from disk, or resetting the Pro entitlement.
- The plate calculator and warm-ups as a feature; the phone checks of earlier features.

## Further Notes

- Tickets: `issues/01` to `issues/05`.
- `docs/decisions.md`, `docs/product.md` and `docs/screens.md` get this feature's entries in tickets 01 and 05, like earlier features.
