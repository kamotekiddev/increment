# 0005: Deleting a custom exercise deletes its history

**Status:** accepted (owner decision 2026-11-25, Phase 3 feature 3 grilling).

## Context

Past workouts point at an exercise row (`workout_exercises.exercise_id`, `sets.exercise_id`). A custom exercise can be deleted, so those rows have to go somewhere. The mockup first promised "your past workouts stay".

## Decision

Deleting a custom exercise is a hard delete that cascades. The exercise leaves every routine, and its Workout exercises, sets, Records and Streaks are deleted with it. A finished workout left with no exercises is deleted too. The Delete sheet names the routines it leaves and says this can't be undone. Delete is blocked while the exercise is in a Workout in progress.

## Alternatives considered

- **Soft delete** (a `deleted_at` flag, history kept, the name freed). Rejected: the owner sees no benefit in keeping history for an exercise the lifter chose to remove, and it would add a hidden-row state to every picker and query.

## Consequences

- `routine_exercises.exercise_id`, `workout_exercises.exercise_id` and `sets.exercise_id` cascade on delete (a migration). Library exercises are never deleted, so nothing else is affected.
- Totals for a workout that keeps other exercises are worked out again without the deleted one.
- Like ADR 0002, there is no undo.
