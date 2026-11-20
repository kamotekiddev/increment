Status: built, waiting for the phone check

# Phase 2 · Feature 4 · Exercise history

Part of Phase 2 (see `.scratch/phase-2/map.md`). Needs: feature 1 (Settings and units). Decisions below come from a grilling session on 2026-11-20.

## Problem Statement

Exercise detail has no History tab, so a lifter cannot see what they lifted last time for one exercise, or how it moved. The Last column in the live workout shows one earlier workout of one routine only.

## Solution

Exercise detail gets a How to / History tab switch. History is its own screen, Exercise history: every finished workout that trained the exercise, newest first, with the done working sets as chips in the lifter's unit. It is free for everyone and stores nothing.

The screens are drawn in the design canvas (`Exercise.dc.html`, `ExerciseHistory.dc.html`, `ExerciseHistoryEmpty.dc.html`). The build differs from the `ExerciseHistory` frame: no summary tiles, no "See your chart with Pro" card and no Record pill (those come with feature 5 and Phase 3), and a grey "Deload" pill is added.

## User Stories

1. As a lifter, I want a How to / History tab switch on Exercise detail, so that I can reach the history of the exercise I am reading about.
2. As a lifter, I want History to list every finished workout that trained this exercise, across all my routines, newest first, so that I see what I lifted and when.
3. As a lifter, I want each row to show the date and the routine's name, so that I know which workout it was.
4. As a lifter, I want the year on the date only when it is not this year, so that old rows are not ambiguous.
5. As a lifter, I want one chip per done working set, such as `62.5 × 8`, in my unit, so that I read it at a glance. A set logged at 62.5 kg reads `137.79 × 8` in lb.
6. As a lifter, I want warm-ups and sets I did not do left out, so that the chips match what counts.
7. As a lifter, I want a Deload workout marked with a grey "Deload" pill, so that a lighter row does not look like a regression.
8. As a lifter, I want a set logged with added weight on a bodyweight exercise to keep its weight (`10 × 8`), and sets with no weight to read `9 reps`, so that old history is not hidden.
9. As a lifter, I want a message "No workouts yet" when the exercise has no finished workout, so that the screen does not look broken.
10. As a lifter, I want Back on History to go straight to the Library, so that switching tabs does not stack screens.
11. As a lifter, I want a workout I just finished to appear when I open History, and the weights to follow my unit when I switch.

## Implementation Decisions

- **Rows:** a finished workout (`in_progress` false) with at least one done, non-warm-up set of the exercise. Chips are those sets in `idx` order. Do not reuse `toHistory` or `judgedPastSets`: they need a plan and one routine. Order by `workouts.started_at` descending, so two workouts on one day keep their order.
- **Header:** date as `Thu, 12 Nov`, with the year (`Sun, 28 Dec 2025`) only when it differs from today's year. `workouts.date` is split by hand (not `new Date("YYYY-MM-DD")`, which is UTC) and the weekday comes from a local `Date`; names come from arrays. Today is passed in. The routine's current name is read by join, none when there is no routine. A rename shows on old rows. A "Deload" pill (`Pill tone="neutral"`) when `workout_exercises.is_deload`.
- **Chip text:** `formatWeight(kg, unit) × reps` when the stored weight is above 0, otherwise `repsText(reps)` (owner decision 2026-11-20, so belt weight logged before the bodyweight split stays visible; this differs from the Last column).
- **No limit, no paging:** all rows, one `FlatList` with the title and tabs as its header and the empty card as `ListEmptyComponent`. Reload on focus; read the unit with `useUnit()`.
- **Empty state:** a card with an icon, "No workouts yet" and "Finish a workout with this exercise and it shows up here." No button. Shown also when the only workout is in progress.
- **Routes:** `src/app/exercise/[id].tsx` becomes `src/app/exercise/[id]/index.tsx` (How to) plus `src/app/exercise/[id]/history.tsx`. The tab switch uses `router.replace`, so Back always leaves for the Library. The library keeps pushing `/exercise/[id]`.
- **Words:** copy says "workouts", never "sessions". Glossary term **Exercise history** is added (done).
- **No schema change, nothing stored** (data rule 2). No ADR.

## Testing Decisions

- **Pure (Jest):** the date label (this year, last year, a year boundary with a passed-in today, a month and weekday by name); chip text in kg, in lb (62.5 kg is `137.79 × 8`), with weight 0 (`9 reps`) and with added weight on a bodyweight exercise (`10 × 8`); the row builder.
- **Database test:** two routines both trained, an in-progress workout excluded, a renamed routine showing the current name, a row with no routine, a workout with only warm-ups or nothing done left out, a Deload flagged, two workouts on one day ordered by start time, sets in `idx` order.
- Not unit-tested: the screens (device check).

## Out of Scope

- Summary tiles, Record pills, records (feature 5).
- The Pro chart card and the Paywall (Phase 3).
- Editing or deleting a past workout.

## Further Notes

- Update `docs/screens.md` and `docs/product.md` (History tab) in the same change; mockup `ExerciseHistory.dc.html` brought in line (tiles, chart card and Record pill out, Deload pill in).
