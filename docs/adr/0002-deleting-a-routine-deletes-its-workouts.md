# 0002: Deleting a routine deletes its workouts, and Target history is per routine

**Status:** accepted

## Context

A routine owns the workouts started from it. There is no undo, and a workout with no routine has no place in the app: Today and the routine screens cannot show it, and in Phase 1 there is no history screen. The same exercise (Bench Press) can sit in two routines, and the lifter expects deleting one routine to leave the other alone.

## Decision

Deleting a routine deletes its workouts, their workout exercises and their sets (`workouts.routine_id` cascades). Workouts started without a routine are never touched. A Streak and a Target belong to an exercise within one routine, so the Target history for an exercise is read from workouts of that routine only. The confirmation names the number of workouts that will go.

## Alternatives considered

- **Keep the workouts with no routine (`set null`, the Phase 0 schema).** Orphaned data the app cannot show, kept only for records. Rejected: with no undo it is clutter nobody can reach.
- **Target history per exercise across all routines.** Gives one shared history, but deleting one routine would change the Target of the same exercise in another routine, which the lifter does not expect.

## Consequences

- A migration changes `workouts.routine_id` from `set null` to `cascade`.
- Feature 3 must read an exercise's history by routine.
- Records that are worked out from all sets (Phase 2) can drop when a routine is deleted; the confirmation text says the workouts go too.
- Hard to reverse once users have data, which is why it is recorded here.
