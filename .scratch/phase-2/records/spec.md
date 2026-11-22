Status: ready-for-agent

# Phase 2 · Feature 5 · Records

Part of Phase 2 (see `.scratch/phase-2/map.md`). Needs: feature 4 (Workout history). Decisions below come from a grilling session on 2026-11-22. The Progress tab body that lists records is feature 6; this feature builds the records themselves and the "New" pills on Past workout and the Workout summary.

## Problem Statement

The app tells the lifter what to lift next, but never says "you just lifted more than you ever have". A lifter who hits 62.5 kg × 8 on bench for the first time gets no sign of it: not on the summary, not in History. Records exist in the docs and the Progress design, but nothing computes them.

## Solution

A **Record** is a best on one exercise, worked out from logged sets and never stored (data rule 2). There are three for an exercise with weight: **Heaviest set**, **Estimated 1-rep max** and **Most volume**. An exercise with no weight (a bodyweight exercise) has two instead: **Most reps in a set** and **Most reps in a workout**.

A finished Workout that beats the lifter's earlier best on an exercise earns a short accent "New" pill per record on that exercise: on its row on **Past workout** (at the right end of the name row, beside the grey Deload pill) and on its card on the **Workout summary** (beside the Clean / Hold pill). The pill reads the record's name, not its value: `Heaviest set`, `1-rep max`, `Most volume`, `Most reps in a set`, `Most reps in a workout`.

The designs are on the canvas: `Progress.dc.html`, `ProgressEmpty.dc.html` and `ProgressBodyweight.dc.html` draw the records (feature 6 builds them). `PastWorkout.dc.html` and `TrainSummary.dc.html` draw no record pills; the build adds them in the same accent-tint pill style as the "New record" pill on Progress.

## User Stories

1. As a lifter, I want a record pill on an exercise when that workout beat my earlier best, so that I notice progress.
2. As a lifter, I want the pill on the Workout summary right after I finish, so that I see it when it happens.
3. As a lifter, I want the same pill on Past workout, so that I can find the workout later.
4. As a lifter on my first workout of an exercise, I want no pills, so that a new routine does not light up everywhere; pills start from the second workout.
5. As a lifter who repeats my best exactly, I want no pill, so that a pill means I did better.
6. As a lifter, I want a heavier weight to be a Heaviest set record, and more reps at the same weight to count too, so that both progress.
7. As a lifter, I want an Estimated 1-rep max record that credits more reps at a lighter weight, so that a 60 × 10 can beat a 65 × 6.
8. As a lifter, I want sets above 12 reps ignored for the 1-rep max, so that a light, long set cannot give a fake record.
9. As a lifter, I want a 1-rep set to count as its own weight for the 1-rep max.
10. As a lifter, I want a Most volume record: the most weight × reps on one exercise in one workout.
11. As a lifter on a bodyweight exercise, I want Most reps in a set and Most reps in a workout, so that records fit exercises with no weight.
12. As a lifter, I want warm-ups, unchecked sets and discarded or open workouts never to count, as in History.
13. As a lifter, I want a Deload workout to count like any other, so that nothing special happens.
14. As a lifter, I want records to belong to the exercise, across all routines, so that a renamed or deleted routine does not reset them.
15. As a lifter who switched units, I want sets in lb and kg compared fairly, so that 135 lb (61.23 kg) beats 60 kg.
16. As a lifter, I want the Heaviest set shown as History shows a set, and the 1-rep max and volume as whole numbers (the pill shows no number).

## Implementation Decisions

- **One records read module** (outside the routes folder, e.g. `src/records/`), the only place that reads the database for records. Records are derived from `sets` on read; nothing is stored, no schema change, no migration.
  - *Workout record tags* (Workout id) → for each exercise of that finished Workout, the list of record names it set, as display text (`Heaviest set`, `1-rep max`, `Most volume`, `Most reps in a set`, `Most reps in a workout`). Returns nothing for an unknown id or a Workout in progress.
  - *Exercise records* (exercise id, unit) → the current best of each record with the date of the workout that set it, for feature 6's Progress tab. Built and tested here so the rules live in one place; no screen reads it yet.
- **Which sets count:** done Working sets (not warm-ups, not unchecked) of finished Workouts only, grouped by the exercise (library exercise id), across all routines. A Workout's own sets count for that Workout only; "earlier" means earlier by start time, the order History uses.
- **Weighted exercise:**
  - *Heaviest set*: the highest weight wins, and more reps at that same weight is a new record (62.5 × 5 after 62.5 × 3). The same weight and reps again is not.
  - *Estimated 1-rep max*: Epley, `weight × (1 + reps ÷ 30)`; a 1-rep set is its own weight; sets above 12 reps are ignored for this record only. The record is the highest estimate over all counted sets.
  - *Most volume*: the sum of weight × reps over the exercise's counted sets in one Workout; the record is the highest Workout total.
- **Bodyweight exercise** (by Load type): *Most reps in a set* (highest reps in one set) and *Most reps in a workout* (highest total reps of the exercise in one Workout). Weight logged on a bodyweight exercise is ignored for records. A weighted twin of a bodyweight exercise is its own exercise with the weighted records.
- **New:** a Workout earns a record's pill when its value beats the best over all earlier finished Workouts of that exercise, and there is at least one earlier Workout with a counted set (the first workout sets the baseline silently). Equal is not new, except the Heaviest set's reps rule above.
- **Units:** every set is converted to kg in memory (`src/units`) to compare and add; stored sets are never changed. Equality uses a tiny tolerance so float noise never makes a tie into a record.
- **Display:** on Progress (feature 6) the Heaviest set reads like History (`62.5 × 8`, or `≈61.2 × 5` from the other unit; `loggedWeightText`), and the Estimated 1-rep max and Most volume are whole numbers (`79 kg`, `1,920 kg`). This replaces the one-decimal line in `docs/architecture.md`. The pills show names only, so no number rounding is needed on Past workout or the summary.
- **Pills on screens:** Past workout shows a pill per tag at the right end of the exercise's name row, beside the Deload pill; the Workout summary shows them in the exercise card's header, beside the outcome pill, wrapping to a second line when there are several. Accent-tint pill (the style of "New record" on Progress), 12 px, weight 600.
- **Words:** "record" and "New", never "PR".
- **No ADR** (nothing hard to reverse), no new dependency. Glossary: **Record** is updated (done).

## Testing Decisions

- **One seam: the records read module**, tested from outside against an in-memory database with every migration applied, like the history read module's tests. Insert exercises, workouts and sets; call the function; assert on the returned tags and records.
- **Workout record tags cases:** first workout of an exercise returns no tags; a heavier second workout returns `Heaviest set` and `1-rep max`; same weight and reps again returns nothing; same weight with more reps returns `Heaviest set`; 60 × 10 after 65 × 6 returns `1-rep max` but not `Heaviest set`; a 40 × 20 set is ignored for the 1-rep max and still counts for volume and heaviest; a 1-rep set counts as its weight; a lower-weight workout with more total volume returns `Most volume`; warm-up, unchecked, discarded and in-progress sets are never counted; a Deload counts normally; sets in lb against a kg best (135 lb beats 60 kg, a tie within tolerance does not); two routines sharing an exercise share its records; a bodyweight exercise returns `Most reps in a set` and `Most reps in a workout` and ignores weight; an unknown id or an in-progress Workout returns nothing.
- **Exercise records cases:** the current best of each record and the date of the workout that set it; the earliest Workout keeps a tied record; no counted set returns none.
- **Not unit-tested:** the pill rendering (device check: finish two workouts of one exercise with a heavier second; see the pill on the summary and on Past workout; none on the first; a unit switch changes no pill).
- Type check, lint and the Jest suite pass before done.

## Out of Scope

- The Progress tab body: picker, hero, Records card, chart preview, empty states (feature 6).
- Charts, All records and a records history over time (Pro, Phase 3).
- Editing or hiding a record. Storing any record.
- Record pills on History rows, Today or the live workout.
- Notes or feeling on a record.

## Further Notes

- Update `docs/screens.md` (Past workout and Workout summary rows), `docs/product.md`, `docs/architecture.md` (the one-decimal line) and `.scratch/phase-2/map.md` (feature 5 marked built, spec pointer) in the same change.
- Build on a fresh branch from `main`.
