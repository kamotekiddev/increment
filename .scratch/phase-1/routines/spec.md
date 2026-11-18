Status: ready-for-agent

# Phase 1 · Feature 2 · Routines

Part of Phase 1 (see `.scratch/phase-1/map.md`). Needs: Library browse (feature 1).

## Problem Statement

The Routines tab is a placeholder. The lifter cannot make a workout to repeat, so there is nothing to start in feature 3 or show in Today.

## Solution

The Routines tab lists the lifter's routines with a free counter ("1 of 2 routines"). The lifter creates a routine with a name and training days, adds exercises from the library, sets sets, reps and rest for each, reorders and removes them, and deletes the routine. Changes save as they go. The progression rule is shown on each exercise but cannot be changed until Pro (Phase 3).

## User Stories

1. As a lifter, I want a list of my routines with days and exercise count (for example "Mon · Thu · 5 exercises"), so that I can tell them apart.
2. As a lifter, I want the list in the order I created them, so that it stays where I left it.
3. As a lifter, I want a counter of routines used, so that I know how many free routines are left.
4. As a lifter, I want a friendly empty state with a Create routine button, so that I know where to start.
5. As a lifter, I want to create a routine with a name and days, so that it is saved at once.
6. As a lifter, I want days optional, and routines allowed to share a day, so that I am not forced into a schedule.
7. As a lifter, I want a clear message when a name is empty or already used (ignoring capitals and spaces), so that I can fix it.
8. As a lifter, I want to rename a routine and have the name checked only when I finish typing, so that half-typed names are not rejected.
9. As a lifter, I want to toggle days and have them saved at once.
10. As a lifter on the free plan, I want a pop-up when I try a third routine (the limit is 2), so that I understand the limit. It has no purchase button yet.
11. As a lifter, I want to add exercises from the library picker, so that I reuse the list I know.
12. As a lifter, I want exercises already in the routine shown as "Added" and not tappable, so that I cannot add one twice.
13. As a lifter, I want tapping an exercise to open a setup sheet with sets, reps and rest prefilled (3 sets, 8–12 reps, 90 s), so that adding is quick.
14. As a lifter, I want to see the progression rule (for example "Adds weight after 3 clean workouts") as read-only text with a Pro badge, so that I know what the app will do.
15. As a lifter, I want the same sheet to edit an exercise already in the routine, so that there is one place to change it.
16. As a lifter, I want Remove from routine in that sheet, with a confirmation.
17. As a lifter, I want a reorder mode with ▲ ▼ per row, saved only when I tap Done and discarded on Cancel.
18. As a lifter, I want to delete a routine with a confirmation that names how many workouts will be deleted with it.
19. As a lifter, I want deleting a routine to leave other routines (and the same exercise in them) untouched.
20. As the developer, I want name, limit and setup rules in plain tested functions, and the Pro limit checked in one place.

## Implementation Decisions

**Pure functions** (no I/O, tested)
- `validateRoutineName(name, existingNames, ownId?)`: trims; 1–40 characters; a duplicate is a case-insensitive match with another routine (never itself). Returns ok or a reason (`empty`, `too-long`, `duplicate`).
- `canCreateRoutine(count, isPro)`: the only place the free limit lives. Limit is 2 (decided). Pro is always true.
- Setup limits: sets 1–10; rep min 1–30, rep max at least rep min; rest 15–600 s in 15 s steps. A clamp helper keeps steppers in range.
- `moveExercise(list, index, direction)` returns the new order; positions are renumbered 0..n-1 when saved.
- `describeRule(rule)` returns the read-only text ("Adds weight after 3 clean workouts" / "Adds reps after 3 clean workouts").

**Data**
- Uses existing `routines` and `routine_exercises`. Days are a bitmask, Monday = bit 0. New routine `position` = current count.
- Adding an exercise stores 3 sets, rep 8–12, 90 s, and `defaultRule(loadType)` from the engine. One row per exercise per routine.
- A new Drizzle migration changes `workouts.routine_id` to cascade (ADR 0002). Deleting a routine removes its routine exercises and its workouts with their exercises and sets. Workouts with no routine are untouched.
- No schema change otherwise.

**Screens** (mockup: Increment canvas, artboards in group 3)
- Routines tab, New routine, Edit routine, Add exercises (the Library's reusable list with a tap action and an "already added" state), Exercise setup sheet, Reorder mode, Remove exercise confirmation, Delete routine confirmation, 2-routines-used pop-up.
- Name saves on finish with an inline error; day buttons and setup edits save at once; reorder saves on Done.
- Built from the base components and tokens. Touch targets at least 44 pt.

## Testing Decisions

- Test external behaviour of the pure functions only. Cover: names (empty, spaces only, 40 and 41 characters, "push" vs "Push", " Push ", renaming to own name in different case, renaming to another's name, a name freed after delete); limit (1 free ok, 2 free blocked, 2 Pro ok); setup clamps at each end; `moveExercise` at first and last index; `describeRule` for weighted, bodyweight and bodyweight-or-weighted.
- Database behaviour (cascade delete, position renumbering) is checked on a device in Expo Go because Jest cannot run the native database; a short checklist is in the last ticket.
- Prior art: engine, units and library test suites.

## Out of Scope

- Choosing or editing the overload rule, miss handling and deload (Phase 3 Pro rule panel).
- Paywall and purchase; the pop-up has no upgrade button yet.
- Starting a workout, Today, rest timer (features 3, 5, 6).
- Reordering routines, duplicating a routine, supersets, notes on exercises.
- Custom exercises; the default rest setting (Phase 2).

## Further Notes

- Open for the owner: the Phase 4 plan generator's push/pull/legs split is 3 routines, which no longer fits the free limit of 2.
- Docs to update in the same change: `docs/screens.md` (new screens), `docs/product.md` (routines bullets, already updated for the limit of 2), `docs/architecture.md` (cascade on `workouts.routine_id`), the Phase 1 map when built.
- The mockup edits are prepared locally and are published only when the owner asks.
