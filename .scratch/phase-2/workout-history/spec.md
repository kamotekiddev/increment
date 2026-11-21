Status: ready-for-agent

# Phase 2 · Feature 4 · Workout history

Part of Phase 2 (see `.scratch/phase-2/map.md`). Needs: feature 1 (Settings and units). Decisions below come from the owner decision of 2026-11-20 (history is per Workout) and a grilling session on 2026-11-21. Replaces the `wontfix` Exercise history spec in `exercise-history/`.

## Problem Statement

Once a lifter taps Finish and leaves the Workout summary, the workout is gone from view. Nothing in the app shows what was done in a past Workout: which exercises, at what Target, and the sets actually lifted. The Target, the live workout's Last column and (later) the Progress tab answer "how is this one exercise going", but a lifter who wants to look back at last Thursday's Push day, or check how long their leg days run, has nowhere to go. The Progress tab is still a placeholder.

## Solution

A **History** pill in the Progress tab header opens **History**: every finished Workout, newest first, across all Routines, under month headers. Each row shows the date, the Routine, the number of exercises and the duration (`Thu, 12 Nov · Push day A`, `5 exercises · 48 min`). Tapping a row opens **Past workout**: the Routine name, date and duration, then the exercises as rows with dividers inside one white card, each with its name, the Target it had, a grey Deload pill at the right end of the name row when it was one, and the done Working sets as chips in the lifter's Unit. Both screens are read-only, free for everyone, and store nothing.

The screens are drawn on the design canvas (`Progress.dc.html` for the pill, `WorkoutHistory.dc.html`, `WorkoutHistoryEmpty.dc.html`, `PastWorkout.dc.html`). The build differs from `Progress.dc.html`: only the title row and the History pill are built, with no "Last 8" dropdown and none of the body (that is feature 6). `PastWorkout.dc.html` draws no Deload pill; the build puts it at the right end of the exercise's name row.

## User Stories

1. As a lifter, I want a History pill in the Progress tab header, so that I can reach my past workouts from the tab about my progress.
2. As a lifter, I want the History pill there even before charts and records exist, so that the button I learn now does not move when they arrive.
3. As a lifter, I want the Progress tab to tell me records are coming ("Your records will appear here."), so that the near-empty tab does not look broken.
4. As a lifter, I want History to list every finished Workout across all my Routines, so that I see all my training in one place.
5. As a lifter, I want the newest Workout first, so that last session is at the top.
6. As a lifter who trained twice in one day, I want the later Workout above the earlier one, so that the order matches what happened.
7. As a lifter, I want the list grouped under month headers that carry the year (`November 2026`), so that I can find a period and old entries are never ambiguous.
8. As a lifter, I want a Workout to belong to the day and month it was started, so that a session that runs past midnight stays on the day I began it, as on Today.
9. As a lifter, I want each row to show the weekday and date (`Thu, 12 Nov`) and the Routine's name, so that I know which workout it was.
10. As a lifter who renamed a Routine, I want old rows to show its current name, so that history matches my Routines tab.
11. As a lifter, I want each row to show how many exercises I did (`5 exercises`, `1 exercise`), so that a short session stands out.
12. As a lifter who skipped an exercise, I want it not counted, so that the count matches what I trained.
13. As a lifter, I want each row to show how long the workout took, so that I can see how my sessions run.
14. As a lifter, I want a duration under an hour to read `48 min`, an exact hour `1 h`, and longer ones `1 h 12 min`, so that long sessions read naturally.
15. As a lifter, I want the duration to be the same number the Workout summary showed, so that the two screens never disagree.
16. As a lifter whose workout was resumed after a crash, I want its real length shown (`3 h 5 min`), so that the app never invents a number.
17. As a lifter with a workout in progress, I want it left out of History, so that the list holds only finished training (the in-progress bar already reopens it).
18. As a lifter, I want a "No workouts yet" card ("Finish a workout and it shows up here.") when I have no finished Workout, so that the empty screen does not look broken.
19. As a lifter, I want to tap a row to open that Workout, so that I can see what I did.
20. As a lifter, I want Back on History to return to Progress, and Back on Past workout to return to History, so that navigation is predictable.
21. As a lifter, I want Past workout's header to show the Routine name, with the date and duration under it (`Thu, 12 Nov · 48 min`), so that I know which session I'm reading.
22. As a lifter, I want one row per exercise, in one white card with dividers, in the order they had in that workout, so that it reads like the session I did.
23. As a lifter, I want each exercise row to show the exercise name, so that I know what it was.
24. As a lifter, I want each exercise row to show the Target that workout had (`Target 62.5 × 8`), so that I can compare what was asked with what I did.
25. As a lifter on a bodyweight exercise, I want the Target in reps (`Target 10 reps`), so that it matches how the exercise progresses.
26. As a lifter, I want no Target text on an exercise's first workout, so that the app does not show a Target that never existed.
27. As a lifter, I want a grey "Deload" pill on an exercise done as a Deload, so that a lighter session does not look like a regression.
28. As a lifter, I want one chip per done Working set (`62.5 × 8`), in set order, so that I read the session at a glance.
29. As a lifter, I want warm-up sets and sets I did not mark done left out, so that the chips match what counts.
30. As a lifter, I want a set with no weight to read `9 reps`, so that bodyweight work reads naturally.
31. As a lifter who logged added weight on a bodyweight exercise before the bodyweight-or-weighted split, I want those sets to keep their weight (`10 × 8`), so that old history is not hidden.
32. As a lifter, I want every weight on History and Past workout (Targets and chips) in my current Unit, so that I never convert in my head: a 62.5 kg set reads `137.79 × 8` in lb.
33. As a lifter who switched units, I want a past Target converted exactly like its sets (`Target 137.79 × 8` over chips of `137.79 × 8`), not snapped to today's plate grid, so that a set that hit the Target reads equal to it.
34. As a lifter who switches back to kg, I want the original numbers again (`62.5`), so that switching units never changes my history.
35. As a lifter, I want no Clean / Hold / Miss label on Past workout, so that it is a plain record of what I lifted (the Workout summary already judged it).
36. As a lifter, I want a Workout I just finished to appear when I open History, and weights to follow my Unit when I change it, so that the screens are never stale.
37. As a lifter, I want Past workout to be read-only, so that I cannot change my history (and the Targets built on it) by accident.
38. As a lifter whose Workout has no Routine, I want it labelled `Workout`, so that the row still makes sense.
39. As a lifter with a year of training, I want the whole list there to scroll, so that I never have to page.

## Implementation Decisions

- **One history read module, two functions, finished display text out.** It lives outside the routes folder, beside the other feature modules, and is the only place that reads the database for these screens.
  - *Workout history* (unit) → month sections, newest first, each with a title (`November 2026`) and rows. A row has the Workout id, the date label (`Thu, 12 Nov`), the Routine label, and the detail line (`5 exercises · 48 min`).
  - *Past workout* (id, unit) → a header (Routine label, `Thu, 12 Nov · 48 min`) and exercise cards (one per Workout exercise; the screen draws each as a row). Each card has the exercise name, the Target text or none, whether it is a Deload, and the chip texts in order. Returns nothing for an unknown id or a Workout in progress.
  - Screens only render what these return; any internal helpers stay private to the module.
- **Which Workouts:** finished ones only (`in_progress` false). Ordered by start time, newest first, so two on one day keep their order. No limit, no paging.
- **Month and date:** from the Workout's stored local `date` (the day it was started), split by hand rather than parsed as UTC; the weekday comes from a local date built from those parts. Month and weekday names come from fixed English arrays. The year is on the month header only, never on the row.
- **Routine label:** the Routine's current name, read by join on the Routine id. A Workout with no Routine reads `Workout`. (Deleting a Routine deletes its Workouts, ADR 0002, so a missing Routine only means a Workout saved with none.)
- **Exercise count:** the Workout exercises kept on the Workout. Finish already removes skipped exercises, so no extra filter. `1 exercise` / `N exercises`.
- **Duration:** finish time minus start time, floored to whole minutes, the same rule as the Workout summary, with no cap. Formatted `48 min` under an hour, `1 h` on an exact hour, `1 h 12 min` above it; `0 min` for under a minute.
- **Exercise cards:** in the Workout exercise's position order, drawn as rows on Past workout.
- **Target text:** from the Workout exercise's stored Target. A bodyweight exercise (by Load type) reads `Target 10 reps`. A weighted one reads `Target <weight> × <reps>`, the weight converted to the current Unit with the existing display conversion (rounded to 0.01, trailing zeros dropped), never snapped to the Jump grid. No Target stored reads as none.
- **Deload pill:** shown when the Workout exercise is flagged as a Deload; the neutral pill.
- **Chips:** sets of the Workout exercise that are done and not warm-ups, in set index order. `<weight> × <reps>` with the same display conversion when the stored weight is above 0, otherwise the existing reps text (`9 reps`). This keeps added weight logged on a bodyweight exercise visible, unlike the Last column (owner decision 2026-11-20).
- **No Clean / Hold / Miss, no record pills** (records are feature 5).
- **Routes:** two stack screens outside the tab group, History and Past workout (by Workout id), pushed from the Progress pill and from a History row. Back pops. Both reload on focus and read the Unit from the existing unit hook, so a Workout finished or a unit switched elsewhere shows on return.
- **History screen:** one sectioned list: the back button and "History" title as header, month titles as section headers, each month's rows in one white card with dividers and a chevron, the empty card ("No workouts yet", "Finish a workout and it shows up here.", the history icon, no button) as the empty component.
- **Past workout screen:** the back button, the Routine label as title with the date and duration line under it, then, as in `PastWorkout.dc.html`, one white card holding the exercises as rows with dividers between them, not a card per exercise. Each row: the name with the Target muted beside it, the neutral Deload pill at the right end of that name row, and the chips wrapping below. An unknown id or a Workout in progress shows an empty screen with Back.
- **Progress tab:** title row with the white History pill (history icon, "History") on the right, and the muted line "Your records will appear here." below. No "Last 8" dropdown and nothing else until feature 6.
- **Words:** copy says "workouts", never "sessions".
- **No schema change, nothing stored** (data rule 2), no new dependency, no ADR, no glossary change ("Workout history" already reads correctly; "Past workout" is a screen name).

## Testing Decisions

- **One seam: the history read module**, tested from outside against an in-memory database with every migration applied, in the style of the existing start-workout database test (insert routines, workouts, Workout exercises and sets; call the function; assert on the returned display text). No separate pure-function tests: if helpers are split out later, the tests do not change.
- **Workout history cases:** a Workout in progress is left out; two Routines both appear; newest first, and two Workouts on one day ordered by start time; month sections across a month and a year boundary (`December 2025` after `January 2026`); the date label's weekday and month; a renamed Routine shows its current name; a Workout with no Routine reads `Workout`; `1 exercise` and `N exercises`; durations `48 min`, `1 h`, `1 h 12 min`, and a long resumed one (`3 h 5 min`); no finished Workout returns no sections.
- **Past workout cases:** header text; cards in position order; a weighted Target in kg and in lb (`Target 62.5 × 8`, `Target 137.79 × 8`); a bodyweight Target (`Target 10 reps`); no Target on a first workout; the Deload flag; chips only for done non-warm-up sets in index order; a chip in lb (`137.79 × 8`); a 0 kg set (`9 reps`); added weight on a bodyweight exercise (`10 × 8`); an unknown id and a Workout in progress return nothing.
- **Not unit-tested:** the screens and the Progress pill (device check: open History from Progress, open a row, Back twice, switch unit in Settings and return, finish a workout and return, empty state on a fresh install).
- Type check, lint and the Jest suite pass before done.

## Out of Scope

- Editing or deleting a past Workout.
- Record pills and records (feature 5).
- The Progress tab body: exercise picker, top set, chart preview, "Last 8" (feature 6).
- Opening a past Workout from Today, the week strip or the Workout summary.
- Showing feeling or notes.
- Clean / Hold / Miss labels on past Workouts.

## Further Notes

- Update `docs/screens.md` (Progress, Workout history, Past workout rows), `docs/product.md` if its history line changes, and `.scratch/phase-2/map.md` (feature 4 marked built, spec pointer) in the same change.
- Build on a fresh branch from `main`.
