# 02: Past workout

**What to build:** Tapping a row on History opens Past workout for that Workout: the Routine name as title with `Thu, 12 Nov · 48 min` under it, then one card per exercise with its name, the Target it had, a grey Deload pill when it was one, and the done Working sets as chips in the lifter's Unit. Read-only. Back returns to History. See `../spec.md`.

**Blocked by:** 01 (History list)

**Status:** ready-for-agent

- [ ] A History row pushes Past workout (a stack screen by Workout id); Back returns to History
- [ ] The history read module adds *past workout* (id, unit) → header and exercise cards as finished display text; returns nothing for an unknown id or a Workout in progress (the screen then shows nothing to read and Back still works)
- [ ] Header: Routine label (current name, or `Workout`), and the date and duration line using the same date and duration text as History
- [ ] Cards in the Workout exercise's position order, each with the exercise name
- [ ] Target text: `Target 10 reps` for a bodyweight exercise (by Load type); `Target <weight> × <reps>` for a weighted one, converted to the current Unit with the existing display conversion and never snapped to the Jump grid (62.5 kg reads `137.79` in lb); none when no Target is stored
- [ ] A neutral "Deload" pill when the Workout exercise is a Deload
- [ ] Chips: done, non-warm-up sets in set index order; `<weight> × <reps>` with the display conversion when the stored weight is above 0, else the existing reps text (`9 reps`); added weight on a bodyweight exercise stays (`10 × 8`)
- [ ] No Clean / Hold / Miss label, no record pills, no edit or delete control
- [ ] Layout follows `PastWorkout.dc.html` and the design tokens; reloads on focus and follows the unit hook
- [ ] Jest database tests through *past workout* only: header text; card order; weighted Target in kg and lb; bodyweight Target; no Target; Deload flag; chips filtered and ordered; chip in lb; `9 reps`; `10 × 8`; unknown id and in-progress return nothing
- [ ] Type check, lint and tests pass
