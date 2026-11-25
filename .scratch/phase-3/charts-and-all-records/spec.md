Status: ready-for-agent

# Phase 3 · Feature 4 · Charts and All records

Part of Phase 3 (see `.scratch/phase-3/map.md`). Needs: feature 1 (the `isPro` gate) and Phase 2 records. Grilled 2026-11-25 (owner decisions below). Designs on the canvas (https://claude.ai/artifact/Ny2LFGjeieuBmcCGHeGb7e): `Progress` (blurred preview, no live chart drawn), `ProgressBodyweight`, `RecordsAll`. The live chart has no frame yet; it needs one (see Further Notes).

Tickets: `issues/01` to `issues/07`.

## Problem Statement

Pro lifters pay for charts and an All records screen, but both are still a "comes with Pro, in a later update" sheet. A lifter can see their latest top set and best records, but not how an exercise moved over weeks, and cannot see every record across exercises in one place. A free lifter who taps the locked preview gets a dead-end sheet instead of the Paywall.

## Solution

A Pro lifter sees a real chart in the Progress hero card, replacing the blurred preview. A metric toggle sits above it and a range dropdown below. Tapping a point shows its date and value. A new All records screen, opened from "See all records", lists every exercise's records, filterable by muscle group. A free lifter (including after a refund) keeps the blurred preview and the Pro-tagged row, and tapping either opens the Paywall; after buying they land back on Progress with the live chart.

## User Stories

1. As a Pro lifter, I want a chart of my exercise in the Progress hero card, so that I see how it moved over time.
2. As a Pro lifter on a weighted exercise, I want to switch the chart between Weight, Est. 1RM and Volume, so that I see the measure I care about.
3. As a Pro lifter on a bodyweight exercise, I want to switch between Reps in a set and Reps in a workout, so that the chart fits an exercise with no weight.
4. As a Pro lifter, I want the chart to open on Weight (or Reps in a set) and Last 8, so that it is useful without choosing.
5. As a Pro lifter, I want to choose Last 8, Last 20 or All, so that I can zoom out to my whole history.
6. As a Pro lifter, I want one point per finished workout, so that the line reads as my training over time.
7. As a Pro lifter, I want the points to use the same counted sets as my Records (done working sets, warm-ups and unchecked sets left out), so that the chart never disagrees with the Records card.
8. As a Pro lifter who trains in both units, I want the chart in my current unit with kg and lb compared fairly, so that a switch does not bend my line.
9. As a Pro lifter, I want to tap a point and read its date and value, so that I can check an exact session.
10. As a Pro lifter with fewer than 2 workouts of an exercise, I want a short message in place of the line, so that I know the chart starts after my second workout.
11. As a Pro lifter whose sets are all above 12 reps, I want "No Est. 1RM yet" instead of a broken line, so that I understand why.
12. As a Pro lifter, I want a workout with no value for the chosen metric skipped and never plotted as 0, so that a gap does not look like a collapse.
13. As a Pro lifter, I want a See all records row that opens All records, so that I can compare every exercise.
14. As a Pro lifter, I want All records to list each exercise with its records and dates, so that I see them in one scroll.
15. As a Pro lifter, I want only exercises I have actually trained listed, so that an unused custom exercise does not clutter it.
16. As a Pro lifter, I want the most recently trained exercises first, so that the list matches the Progress picker.
17. As a Pro lifter, I want muscle group chips (All plus groups I have records in), so that I can filter to Chest or Legs.
18. As a Pro lifter, I want a banner such as "14 records · 2 new", so that I see my total and what is new.
19. As a Pro lifter, I want "New" on All records to mean the same as on Progress (set in that exercise's last workout), so that the two screens never disagree.
20. As a Pro lifter, I want bodyweight exercises to list their two reps records, so that nothing weighted shows for them.
21. As a free lifter, I want the blurred chart preview kept, so that I know what Pro adds.
22. As a free lifter, I want tapping the preview or See all records to open the Paywall, so that I can unlock them at once.
23. As a lifter who just bought Pro, I want to land back on Progress with the live chart and nothing opening by itself, so that I see what I paid for.
24. As a lifter after a refund, I want the chart to go back to the blurred preview and See all records to open the Paywall, so that only Pro actions lock.
25. As a lifter after a refund, I want my records and history to stay, so that I lose nothing I made.
26. As a lifter, I want the chart to work offline, so that it works at the gym.
27. As a lifter, I want a custom exercise to chart and list like a library one, so that what I made counts.

## Implementation Decisions

- **Chart read (records read module, existing seam).** A new read returns the chart series for an exercise, a metric and a range in the current unit: one point per finished Workout that has a value, oldest first, each with its date and value. Metrics for a weighted exercise: top set weight (Heaviest), Estimated 1-rep max, Volume. For a bodyweight exercise: reps in a set and reps in a workout. A bodyweight exercise rejects the weighted metrics and the reverse. Counting, grouping, kg comparison, the 12-rep cap for the 1-rep max, zero-rep and zero-weight rules are the Phase 2 records rules, not new ones. A workout whose metric has no value (for example every set above 12 reps for the 1-rep max) is skipped, never 0.
- **Ranges:** Last 8 (default), Last 20, All. "Last N" means the latest N plottable workouts of that metric.
- **All records read (same module).** Returns, for the current unit, every exercise with at least one counted set, most recently done first, with its records (existing exercise records), each record's date, a "New" flag (set in that exercise's last finished workout, the Progress rule), the muscle group, and the totals for the banner (record count, new count). Exercises with no counted set are left out.
- **Chart geometry (new pure function).** From the points and a width and height, returns scaled x/y, y-axis ticks and the SVG path (line and fill under it). Equal values draw a flat line, never NaN. The chart is drawn with `react-native-svg` (already installed); Skia is a fallback only if SVG can't draw it. No new dependency.
- **Progress hero (Pro).** The blurred preview becomes the live chart: metric toggle above, range dropdown below, tap-a-point readout. Weighted and bodyweight exercises get their own toggle labels (Weight / Est. 1RM / Volume; Reps in a set / Reps in a workout). Fewer than 2 plottable points shows a muted line ("Your chart starts after your second workout." or, for a metric with no values, "No Est. 1RM yet: every set was over 12 reps.") instead of a line; the toggle stays.
- **Free state.** The blurred preview and the grey Pro tag stay. Tapping the preview or "See all records" opens the Paywall directly; the "comes with Pro, in a later update" sheet is removed. After buying, the lifter lands back on Progress with the live chart; nothing opens by itself.
- **After a refund.** Pro off puts the chart back to the blurred preview and See all records back to the Paywall. Records and history stay. Reads are free; only the chart and All records screens are gated, in the one Pro-gate place (product rule 7), with no `isPro` check scattered in components.
- **All records screen.** Back button, title "Personal records" with a Pro pill, muscle chips ("All" plus only groups that have a listed exercise), a banner ("14 records · 2 new", "this week" dropped from the mockup), then one white card per exercise with its record rows and a "New" pill where the flag is set. Cards are read-only. Bodyweight exercises list Most reps in a set and Most reps in a workout.
- **Display:** Heaviest set reads like History (`62.5 × 8`, `≈…` from the other unit); Est. 1-rep max and volume are whole numbers; chart values follow the same unit rules. A custom exercise behaves like a library one.
- **Words:** "record" and "New", never "PR". No new glossary term is needed beyond the existing Record; add "All records" only if the glossary has none.
- **No ADR** (reversible), no schema change, no migration, nothing stored.

## Testing Decisions

- A good test calls the module from outside and asserts on what the lifter would see (points, order, values, who is listed, flags). It does not test SVG or React internals.
- **Seam 1: the records read module**, against an in-memory database with every migration applied (prior art: the Phase 2 records and history query tests). Chart series cases: 12 workouts with Last 8 returns the latest 8, oldest first; All returns all; Last 20 with 12 returns 12; each of Weight, Est. 1RM and Volume on a known set; a workout with only sets above 12 reps is skipped for Est. 1RM and still counts for Volume; warm-up, unchecked, discarded and in-progress sets never count; 135 lb against 60 kg compare in kg and show in the current unit; a bodyweight exercise returns reps metrics and refuses weighted ones; a custom exercise charts; fewer than 2 points returns what the screen needs to show the message. All records cases: only exercises with a counted set; most recently done first; the "New" flag follows the last workout; banner counts; muscle group present; bodyweight exercise lists two records; an unused custom exercise is left out.
- **Seam 2: chart geometry (pure).** Points to scaled coordinates and path: 8 points into a 318 × 110 box; equal values draw a flat line; one point and zero points do not throw; the y-axis ticks bracket min and max.
- **Not unit-tested (device check):** the screens, toggle and range controls, tap-a-point readout, the muted messages, the free tap to the Paywall and back to Progress, a refund returning the preview, and the muscle chips. Dev "Pro source" switch (Free / Pro) makes the free/Pro check possible.
- Type check, lint and Jest pass before done.

## Out of Scope

- Skia or Victory Native (only if SVG proves unable).
- Pinch zoom, a date-range picker, comparing two exercises, or a chart on any other screen.
- Editing, hiding or storing any record; a records history over time.
- Tapping a card on All records to open the exercise (read-only as drawn).
- Export or backup of chart data (features 6 to 8).
- Record pills elsewhere (done in Phase 2).

## Further Notes

- **Look chosen (owner, 2026-11-25): variant A, line + area.** Metric toggle above, line with a soft fill and dots, tap a dot for date and value, range button (Last 8 / Last 20 / All) under it. Seen as clickable prototypes on the canvas (`ProgressChartA/B/C.dc.html`, scenarios weighted, bodyweight, one workout, no 1RM); B (bars) and C (minimal) were not chosen. The code prototype was deleted unsaved.
- **Design:** the canvas has no final live chart frame and `RecordsAll` still says "this week" and uses short labels ("Heaviest", "Est. 1-rep max"). Add a `ProgressChart` frame (weighted and bodyweight, the muted messages) and update `RecordsAll` before build; ticket 01 asks the owner to review.
- Update `docs/screens.md` (Progress row, the empty All records row, the Pro sheet text), `docs/product.md`, `docs/decisions.md` (owner decisions 2026-11-25), `docs/architecture.md` (Charts row says Victory Native), `GLOSSARY.md` if it needs a term, and `.scratch/phase-3/map.md` (feature 4 built, and feature 5 marked removed in PR #31) in the same change.
- Build on `feature/phase-3-charts-and-all-records` from `main`.
