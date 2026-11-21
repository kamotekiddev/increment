# 02: Past workout

**What to build:** Tapping a row on History opens Past workout for that Workout: the Routine name as title with `Thu, 12 Nov · 48 min` under it, then one card per exercise with its name, the Target it had, a grey Deload pill when it was one, and the done Working sets as chips in the lifter's Unit. Read-only. Back returns to History. See `../spec.md`.

**Blocked by:** 01 (History list)

**Status:** built

- [x] A History row pushes Past workout (a stack screen by Workout id); Back returns to History
- [x] The history read module adds *past workout* (id, unit) → header and exercise cards as finished display text; returns nothing for an unknown id or a Workout in progress (the screen then shows nothing to read and Back still works)
- [x] Header: Routine label (current name, or `Workout`), and the date and duration line using the same date and duration text as History
- [x] Cards in the Workout exercise's position order, each with the exercise name
- [x] Target text: `Target 10 reps` for a bodyweight exercise (by Load type); `Target <weight> × <reps>` for a weighted one, converted to the current Unit with the existing display conversion and never snapped to the Jump grid (62.5 kg reads `137.79` in lb); none when no Target is stored
- [x] A neutral "Deload" pill when the Workout exercise is a Deload
- [x] Chips: done, non-warm-up sets in set index order; `<weight> × <reps>` with the display conversion when the stored weight is above 0, else the existing reps text (`9 reps`); added weight on a bodyweight exercise stays (`10 × 8`)
- [x] No Clean / Hold / Miss label, no record pills, no edit or delete control
- [x] Layout follows `PastWorkout.dc.html` and the design tokens; reloads on focus and follows the unit hook
- [x] Jest database tests through *past workout* only: header text; card order; weighted Target in kg and lb; bodyweight Target; no Target; Deload flag; chips filtered and ordered; chip in lb; `9 reps`; `10 × 8`; unknown id and in-progress return nothing
- [x] Type check, lint and tests pass

**Not verified here:** the screen layout against `PastWorkout.dc.html`, the row push and Back, reload on focus and on a unit switch were type-checked only, not run on a device. Ticket 03 does the device check. The mockup shows no Deload pill; it sits at the right end of the exercise name row. As in the mockup, the exercises are rows with dividers inside one white card rather than separate cards. `ScreenHeader` gained an optional `subtitle` for the date and duration line.
