# Feature 8 phone check (owner)

Run on a real iPhone and a real Android phone, with Pro unlocked unless stated.

## Export, CSV
- [ ] Export progress > Spreadsheet > Export N sets opens the share sheet; the file is named `Increment export {date}.csv`.
- [ ] The CSV opens in Excel and in Google Sheets with columns split correctly.
- [ ] A custom exercise or routine with a non-ASCII name (for example "Press é", "Squat 深蹲") shows correctly (the file has a UTF-8 BOM).
- [ ] A name starting with `=` or `-` shows as text, never a formula (leading `'` guard).
- [ ] Kg rows and lb rows: `weight` as typed, `unit` kg or lb, `weight_kg` to two decimals (135 lb = 61.23).
- [ ] Warm-ups show `is_warmup` true; skipped sets and a Workout in progress are absent.
- [ ] 30 days, 3 months and All time change the count on the button and the preview; an empty range says "No sets in this range." and disables the button.

## Export, PDF
- [ ] PDF report > Export N sets shares `Increment report {date}.pdf`.
- [ ] Renders on iOS and on Android: totals header, records table, one chart per exercise, bodyweight exercise charted in reps, an exercise under 2 points shows the muted line.
- [ ] Page breaks never cut a chart or a table row; a long history flows to more pages cleanly.

## Pro gate
- [ ] Free lifter: the Export row is locked with a Pro tag, opens the Paywall, and after buying lands back on Your data.
- [ ] After a refund (or the dev Pro source set to Free) the row locks again.

## Delete all data
- [ ] With a Workout in progress, tapping Delete all data shows "Finish or discard your workout first." at once, before any typing.
- [ ] On a Pro phone with automatic backups on, and backup files visible in Files (iOS: On My iPhone > Increment; Android: the chosen folder): the sheet shows counts, "Your Pro purchase isn't affected.", and the "Create a backup first" row (a free phone must not show it).
- [ ] Typed sheet: the keyboard doesn't hide the field or the Delete everything button; DELETE in any case or with spaces enables the red button.
- [ ] After Delete everything: Your data shows 0 workouts, 0 sets, 0 records, "No backup yet"; Pro is still unlocked; reminders are cancelled (none arrive); automatic backups are off; preferences are back to defaults (kg, 90 s rest).
- [ ] "All your data was deleted." appears; note how long it stays (it should stay until the lifter leaves Your data or opens the sheet again; decide if that is right).
- [ ] The backup files in Files are still there; Restore from a backup brings the workouts and routines back.

## Owner action
- [ ] Fix the canvas frames `DataExport`, `DataBackup` and `DataBackupPro` (https://claude.ai/artifact/Ny2LFGjeieuBmcCGHeGb7e): `DataExport` still says "Weights export in kg, your current unit" (replace with weights as typed, unit and kg columns); `DataBackup` and `DataBackupPro` still show two Export rows (Spreadsheet, PDF report) and "Later" placeholders; they become the single "Export your progress" row and the red Delete all data link.
