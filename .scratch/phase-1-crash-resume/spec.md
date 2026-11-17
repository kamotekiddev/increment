Status: ready-for-human

# Phase 1 · Feature 7 · Crash resume

Part of Phase 1 (see `.scratch/phase-1-core-training-loop/map.md`). Needs: Live workout (3) and Rest timer (6). Decisions come from a grilling session on 2026-11-17.

## Problem Statement

Sets are already saved as the lifter goes, but when the phone kills the app mid-workout the lifter reopens to Today, loses the running rest, and an earlier row they typed into can be overwritten by a later edit.

## Solution

After a cold launch, the app reopens straight into the workout in progress, on the first exercise that still has an open set, with a still-running rest timer restored. Backgrounding and returning never triggers it.

## Decisions

1. **Cold launch only.** The workout opens over Today once per app process. Minimize lands on Today. Foregrounding does nothing.
2. **Which exercise.** The first exercise with an open set (the first exercise when none is open). This also applies when the workout is reopened from the bar, because the screen picks it when it loads.
3. **Rest timer.** The end time, total length and the set that started it are saved on the workout on every change. A rest still running is restored; one that ended while the app was dead is dropped with no buzz and no move to another exercise. The restored rest keeps its "Rest over" notification: the one queued before the kill is cancelled at app start and a new one is scheduled when the workout screen opens.
4. **Edited mark.** Saved on the set (`sets.edited`), so a restart behaves like no restart.
5. **Old workouts.** A cold launch reopens the workout only when its last saved edit (`workouts.last_edited_at`, falling back to `started_at`) is within 12 hours. Otherwise the app opens on Today, where the bar and Resume-or-discard still work. The rest timer is restored either way.
6. **Finish flow.** No resume for the Offer and summary screens (decided in feature 4's spec); a kill there lands on Today.

## Implementation Decisions

- Migration `0003`: `sets.edited`; `workouts.last_edited_at`, `rest_ends_at`, `rest_total_ms`, `rest_exercise_index`, `rest_set_index`. The backup format is not built yet, so no format bump.
- Pure seam `src/workout/resume.ts` (window, first open exercise, stored rest to timer and back), Jest tested.
- `src/workout/resumeQueries.ts`: store subscriber that saves the timer, `hydrateRest`, and `useResumeOnLaunch` (used in the tabs layout, so the root navigator is mounted).
- `editSet` writes the edited mark even when the typed value equals the current one, and both `editSet` and `markSetDone` stamp `last_edited_at` in the same transaction.

## Out of Scope

- Reopening the summary or offers (Phase 2 history).
- A half-typed number that was not yet a valid value.

## Further Notes

- Branched from `feature/phase-1-rest-timer` because it depends on feature 6, whose phone check is still pending.
