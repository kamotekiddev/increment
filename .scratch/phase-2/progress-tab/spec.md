Status: built (device check left to the owner)

# Phase 2 · Feature 6 · Progress tab

Part of Phase 2 (see `.scratch/phase-2/map.md`). Needs: feature 5 (Records, built). Decisions below come from a grilling session on 2026-11-22. The designs are on the canvas: `Progress`, `Progress no workout yet` and `Progress bodyweight exercise` (see `docs/screens.md`, row "Progress").

## Problem Statement

The Progress tab is only a title and a History pill with the line "Your records will appear here." Records are worked out (feature 5) and shown as "New" pills for one workout, but the lifter has no place to look at an exercise over time: what their top set was last workout, whether it went up, and what their records are right now.

## Solution

The Progress tab shows one exercise at a time, chosen with a picker pill under the title:

- A **hero card**: "Top set, last workout" in big type (`62.5 × 8 kg`, or `10 reps` for an exercise with no weight), an accent "New record" pill when that workout set a Record, a muted line comparing it with the workout before, and a blurred chart preview with a "Charts come with Pro" chip.
- A **Records card** with Heaviest set, Estimated 1-rep max and Most volume (an exercise with no weight has Most reps in a set and Most reps in a workout), each with its date and a small accent "New" pill when the last workout set it, ending in a "See all records" row with a grey Pro tag.
- An **empty card** ("Your first record is one workout away") with dashed placeholder rows when the exercise has no finished workout.

Charts and All records are Pro and arrive in Phase 3; here both are drawn as designed and open a short notice.

## User Stories

1. As a lifter, I want to see my top set from my last workout on an exercise, so that I know where I stand.
2. As a lifter, I want to see how that top set compares with the workout before, so that I can tell whether I am progressing.
3. As a lifter, I want a "New record" pill on the hero when my last workout set a Record, so that I notice it.
4. As a lifter, I want my current Records for an exercise on one card with the date each was set, so that I know what to beat.
5. As a lifter, I want a small "New" pill on each record my last workout set, so that I can see which ones moved.
6. As a lifter, I want to pick the exercise from a list, so that I can look at any exercise I train.
7. As a lifter, I want Progress to open on the exercise I did most recently, so that I see what I just did without picking.
8. As a lifter who has just finished a workout, I want Progress to open on that workout's last exercise even if I picked another earlier, so that the new records are in front of me.
9. As a lifter, I want my pick to stay while I move between tabs, so that I am not thrown back.
10. As a lifter, I want exercises I have never finished to be in the picker, marked "Not done yet", so that I can see what has no history.
11. As a lifter, I want to see the exercises in my routines and anything I have ever done, most recently done first, so that the one I want is near the top.
12. As a lifter with a long list, I want a search field in the picker once the list is long, so that I can find an exercise fast.
13. As a lifter on a bodyweight exercise, I want the top set in reps and Most reps in a set and in a workout, so that the numbers fit.
14. As a lifter, I want a weighted twin of a bodyweight exercise (Weighted pull-up) to be its own entry with weighted records.
15. As a lifter with an exercise with no finished workout, I want a friendly empty card and placeholder rows, so that I know what will appear.
16. As a lifter with no routines and no finished workout, I want Progress to say there is nothing yet, so that the screen is not blank or broken.
17. As a lifter on my first workout of an exercise, I want to see my top set and records without any "New" pill, and a line saying it was my first workout, so that a baseline is not a celebration.
18. As a lifter, I want "same as 29 Oct" when my top set did not change, and "up 2 reps since 29 Oct" when only reps changed, so that the line is honest.
19. As a lifter, I want "down 2.5 kg since 29 Oct" when my top set went down, such as after a Deload, so that I see what happened.
20. As a lifter who switched between kg and lb, I want every number in my current unit, with "≈" and one decimal for sets logged in the other unit (as History shows them), so that nothing looks wrong.
21. As a lifter, I want Heaviest set to read as History shows a set, and the 1-rep max and volume as whole numbers, so that the card is easy to read.
22. As a lifter, I want a "Charts come with Pro" chip and a "See all records" row, so that I know what is coming.
23. As a lifter, I want tapping either Pro spot to open a short notice and an OK button, so that nothing seems broken.
24. As a lifter, I want the History pill to stay in the same place and still open Workout history.
25. As a lifter, I want the screen to fit a small phone and scroll, and to work with a larger text size.

## Implementation Decisions

- **One Progress read module** (outside the routes folder), the only place that reads the database for this screen. It builds on the records module and the history module and adds nothing to the schema (no migration; Records stay unstored, data rule 2).
  - *Picker list*: the exercises in any routine plus every exercise with a finished workout, one entry per library exercise (a weighted twin is its own entry), most recently done first, then the routine-only ones. Each entry has the exercise id, name, equipment, and the date of its last finished workout or none.
  - *Default exercise*: the most recently done exercise; with no finished workout, the first routine exercise; with neither, none.
  - *Exercise progress* (exercise id, unit) → the hero and the records for that exercise: the last finished workout's date and its top set, the line comparing it with the workout before, whether that workout set a Record, the current Records with their dates and which of them the last workout set, and whether the exercise has no weight.
- **Top set**: the heaviest done Working set of the exercise in a workout, with more reps winning a tie; for an exercise with no weight, the set with the most reps. Only finished workouts count, as in History and Records. The words "Top set" are in `GLOSSARY.md`.
- **Hero line**: the last workout's date, then `up 2.5 kg since 29 Oct`, `down 2.5 kg since 29 Oct`, `same as 29 Oct`, `up 2 reps since 29 Oct` (a rep change at the same weight, or for an exercise with no weight), or `first workout` when there is no earlier workout with a counted set. The comparison is with the top set of the workout just before the last one; a Deload is not special-cased. A change in weight is shown in the lifter's unit, with "≈" and one decimal when either set was logged in the other unit.
- **"New" on the hero and the card**: taken from the records module's per-workout tags for the last workout, never from dates, so the first workout (a silent baseline) shows none. The hero pill reads "New record" when the tag list is not empty. Each record row shows "New" when its own tag is in the list.
- **Picker**: opens a bottom sheet with a simple list (equipment icon, name, "Thu, 12 Nov" or "Not done yet", a tick on the selected one); a search field shows only when the list has more than 8 exercises. Tapping an exercise selects it and closes the sheet. The Records card header uses the full exercise name, the same as the picker.
- **Remembered pick**: kept in memory only, so it survives tab switches and not an app restart. It is cleared when a workout is finished, so Progress then opens on the default exercise.
- **Pro hooks**: the chart preview is a fixed blurred picture, not drawn from the lifter's data. Tapping it or the "See all records" row opens one shared sheet: "Charts and All records come with Pro, in a later update." with an OK button. Phase 3 replaces the sheet with the Paywall link. No `isPro` check is added now (rule 7: one place, in Phase 3).
- **Empty states**: an exercise with no finished workout shows the empty card from the canvas ("Your first record is one workout away" and "Finish a workout with {name} and your heaviest set, estimated 1-rep max and most volume show up here.") and the Records card with "– – –" placeholders. A lifter with no routines and no finished workout sees the title row, the History pill and the muted line "No workouts yet."
- **Records display**: Heaviest set as History shows a set (`62.5 × 8`, `≈61.2 × 5`), Estimated 1-rep max and Most volume as whole numbers with the unit (`79 kg`, `1,920 kg`), reps as `10 reps` and `28 reps`. When every counted set is above 12 reps, the 1-rep max row reads "– – –" (the records module returns none).
- **Words**: "record" and "New", never "PR".
- **No ADR** (nothing hard to reverse), no new dependency, no new setting. The new term "Top set" is in the glossary (done).

## Testing Decisions

- A good test checks what the lifter sees through the module's public functions, not how it reads the database.
- **One seam: the Progress read module**, tested from outside against an in-memory database with every migration applied, the way the records and history read modules are tested.
- **Picker list cases**: finished exercises first, most recently done first, then routine-only exercises ("Not done yet"); an exercise in two routines appears once; a weighted twin is its own entry; no routines and no finished workout returns an empty list; a discarded or open workout does not make an exercise "done".
- **Default exercise cases**: the most recently done; the first routine exercise when nothing is finished; none when there is nothing.
- **Hero cases** (weights and units as in the Q2 table): up 2.5 kg (60 × 8 to 62.5 × 8); same (62.5 × 8 twice); reps only (62.5 × 8 to 62.5 × 10); down after a Deload (62.5 × 8 to 60 × 8); first workout; a bodyweight exercise (9 to 10 reps); a tie on weight picks the set with more reps; warm-up and unchecked sets are ignored; a set in lb against a kg set is compared in kg and shown with "≈".
- **New cases**: a first workout has no "New" and no "New record"; a heavier second workout has "New record" and "New" on Heaviest set and Estimated 1-rep max; an equal workout has none; a "New" only on the records the last workout set.
- **Records cases** reuse the records module's own tests; here only that the module forwards them with the unit.
- **Not unit-tested**: screen rendering, the picker sheet, the Pro notice and the in-memory pick (device check below).
- **Device check (owner)**: finish two workouts of one exercise with a heavier second and see the hero, the line, the pills and the records; pick another exercise, leave the tab and come back; pick an exercise never done and see the empty card; a bodyweight exercise; switch the unit and see the same numbers in the other unit; finish a workout and see Progress open on its last exercise; tap the chart chip and "See all records".
- Type check, lint and the Jest suite pass before done.

## Out of Scope

- Charts, the weight / est. max / volume toggle, "Last 8" and All records (Pro, Phase 3).
- The Paywall and any `isPro` check (Phase 3).
- A stored "last picked exercise" (settings row or column).
- Record pills on History rows (decided in feature 5).
- A records history over time, editing or hiding a Record.
- Light/dark theme.

## Further Notes

- Update `docs/screens.md` (the Progress rows: picker contents, hero line, Pro notice, empty states), `docs/product.md`, `docs/decisions.md` (a "Progress tab" entry) and `.scratch/phase-2/map.md` (feature 6 marked built, spec pointer) in the same change.
- The canvas draws "Bench press" in the Records header and "Barbell bench press" in the picker; the build uses the full name in both.
- Build on a fresh branch from `main`.
