Status: ready-for-agent

# Phase 1 · Feature 3 · Live workout core

Part of Phase 1 (see `.scratch/phase-1-core-training-loop/map.md`). Needs: Routines (feature 2). Decisions below come from a grilling session on 2026-11-16.

## Problem Statement

The lifter has routines but cannot train from them. Nothing shows what to hit today, and nothing records the sets, so the engine has no history to build a Target from.

## Solution

The lifter taps Start workout on a routine. Each exercise shows its Target from the engine, with set rows prefilled to the Target. The lifter marks sets done, adjusts weight and reps, and taps Finish. The workout and the Target that was shown are saved. There is no summary, step offer, rest timer or Today yet; Finish returns to where the workout started.

## User Stories

1. As a lifter, I want a Start workout button on my routine's Edit screen, disabled when it has no exercises, so that I can begin training.
2. As a lifter, I want each exercise to show its Target, so that I know what to hit.
3. As a lifter, I want set rows prefilled with the Target (for example 60 kg × 10), so that a normal set is one tap.
4. As a lifter doing an exercise for the first time, I want weight blank and reps prefilled at the bottom of the rep range, with a note to pick a weight I can do for the range, so that the first workout is as quick as later ones.
5. As a lifter, I want rows below one I edit to follow it until I have touched them or marked them done, so that changing weight is one edit.
6. As a lifter, I want to type weight and reps, and nudge the weight by the Jump with − and +, so that the usual change is one tap.
7. As a lifter, I want a read-only "Last" column showing the same set from my last finished workout of this routine exercise, so that I can judge whether to go heavier.
8. As a lifter, I want the number of sets to be the plan's number, so that every workout is judged against the same plan. There is no Add set and no remove-set control.
9. As a lifter, I want my workout saved as I go, so that nothing is lost.
10. As a lifter, I want only one workout in progress; starting another asks Resume or Discard.
11. As a lifter, I want an "in progress" bar on every tab that reopens the workout, so that I can leave the screen and return.
12. As a lifter, I want Discard workout in a ⋯ menu, behind a confirmation, so that a mistaken start leaves no trace.
13. As a lifter, I want Finish to confirm when sets are not done, then drop them, so that a stray tap does not cost me a Miss.
14. As a lifter, I want Finish with no sets done to offer Discard, so that no empty workout is saved.
15. As a lifter, I want an exercise with no done sets to be left out of the saved workout and not counted as a Miss, so that skipping is not punished. The Finish prompt names skipped exercises.
16. As a lifter, I want the routine I am training to be locked (no edit, no delete) until I finish or discard, while my other routines stay editable, so that the live screen never loses its routine.
17. As the developer, I want the next Target to read history by routine only (ADR 0002).

## Implementation Decisions

**Data**
- Start creates the `workouts` row (`in_progress = true`), a `workout_exercises` row per routine exercise (with the Target shown, null if none) and the set rows, from the routine as it is at that moment. Every edit and done check writes at once. Finish sets `finished_at` and `in_progress = false`.
- `progress_accepted` stays false in this feature (feature 4 sets it).
- Weights are kg; `entered_unit` is `kg` for now (units arrive in Phase 2).
- The Jump is one named constant, 2.5 kg, for every exercise. The Phase 2 setting replaces it. Open item in `docs/decisions.md`.

**Pure functions** (no I/O, tested)
- Initial set rows: from Target and planned sets, or the no-Target case (blank weight, reps at the range minimum).
- Follow rule: given rows and an edit, which later rows change (only untouched, not-done rows).
- Finish check: counts unchecked sets, skipped exercises, and the no-sets-done case.
- Which sets the engine sees: done working sets only, by plan position.

**Behaviour**
- A set cannot be marked done while its weight is blank; the done check does nothing until a weight is typed.
- One workout in progress at a time. Start on any routine while one exists prompts Resume or Discard.
- Lock: Edit and Delete on the in-progress routine are disabled with "Finish or discard your workout first". This changes the feature 2 screens.
- Discard deletes the workout, its exercises and its sets.
- Finish returns to where the workout started.

**Screens** (mockup changes needed)
- Live workout with set table, Target banner, ⋯ menu.
- New in the mockup: the **Last** column, and the **in-progress bar** shown above the tab bar.
- Finish prompts (unchecked sets, skipped exercises, no sets done) and the Discard confirmation.
- Resume or Discard prompt; locked state on the routine's Edit screen.

## Testing Decisions

- Test external behaviour of the pure functions: prefill with and without a Target; follow rule (untouched rows follow, edited and done rows do not, change on set 2 only affects set 3); finish check (all done, some unchecked, none done, one skipped exercise); extra sets not judged.
- Database behaviour (create at Start, discard, lock) is checked on a device in Expo Go; a short checklist goes in the last ticket.
- Prior art: engine and routines test suites.

## Out of Scope

- Workout summary, step offer and Accept/Decline (feature 4).
- Today and the week strip (feature 5).
- Rest timer, keep-awake (feature 6).
- Crash resume (feature 7). Saving as you go makes it small, but reopening after a kill is its own feature.
- kg/lb switch and Jump setting (Phase 2); adding or removing a set (the set count is fixed to the plan); notes and how it felt; warm-up sets; swapping or adding exercises mid-workout; plate calculator.

## Further Notes

- Docs to update in the same change: `docs/screens.md` (Last column, in-progress bar, locked state), `docs/product.md`, the Phase 1 map when built.
- Mockup edits for the Last column and the in-progress bar are prepared locally and published only when the owner asks.
