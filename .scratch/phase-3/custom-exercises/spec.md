# Phase 3 · Feature 3 · Custom exercises: spec

Status: ready to build, grilled 2026-11-25 (owner decisions below). Needs: feature 1 (the `isPro` gate).
Design (on the canvas, https://claude.ai/artifact/Ny2LFGjeieuBmcCGHeGb7e): `ExerciseNew`, `ExerciseEdit`, `ExerciseDelete`, `LibraryEmpty`. These need updating before build (see "Design changes").

Tickets: `issues/01` to `issues/08`. Ticket 01 asks the owner to review the design changes before the canvas is edited.

## What the lifter gets
1. Create a custom exercise (Pro) from the Library **+** or the no-match "Create" row.
2. Edit it (Pro).
3. Delete it. Its history goes with it ([ADR 0005](../../../docs/adr/0005-deleting-a-custom-exercise-deletes-its-history.md)).
4. After a refund, existing custom exercises keep working everywhere. Only Create and Edit lock.

## Decisions
1. **No Time tracking.** Only weight × reps and reps only. Time would be a separate feature with its own ADR.
2. **Names.** Unique across the library and custom exercises, compared trimmed and ignoring case, 1 to 40 characters. A custom exercise can never take a library name. Editing keeps its own name without clashing with itself. The field shows "You already have an exercise called {Name}." and Save stays off.
3. **Equipment.** Six chips: Barbell, Dumbbell, Machine, Cable, Bodyweight, Other. Stored lowercase (`other` is a new value; `equipmentIcon` already gives it the dumbbell).
4. **Main muscle.** One of the six groups (Chest, Back, Shoulders, Legs, Arms, Core), stored as `muscles = ["<group lowercase>"]`. `GROUP_BY_MUSCLE` in `src/library/muscleGroups.ts` learns `back`, `legs`, `arms`, `core` (`chest`, `shoulders` already exist). Exercise detail shows it as the first pill.
5. **Load type from equipment.** Bodyweight gives `bodyweight`, anything else gives `weighted`. There is no "How you track it" control. Written on Create and whenever Equipment changes.
6. **Equipment edit after use.** Once the exercise is in a routine or has a logged set, Equipment can't be switched to or from Bodyweight (those chips are disabled with the note "Bodyweight can't be switched once the exercise is used."). Other switches stay open. Before use, all six are open.
7. **How to.** A list of step boxes: "1" badge, a remove (x) per box, "+ Add step" adds one and focuses it, empty boxes ignored on Save, 10 steps and 200 characters each at most. Stored as `instructions: string[]`. Edit shows the same block. With no steps, the "How to" heading on Exercise detail is hidden.
8. **Delete.**
   - Hard delete, cascading ([ADR 0005](../../../docs/adr/0005-deleting-a-custom-exercise-deletes-its-history.md)). It removes the exercise from every routine and deletes its Workout exercises, sets, Records and Streaks.
   - A finished workout left with no exercises is deleted too.
   - The sheet names the routines it leaves (or says none) and warns that the exercise's history is deleted for good and can't be recovered.
   - Blocked while the exercise is in the Workout in progress: the button is disabled with "{Name} is in your workout in progress. Finish or discard it first."
9. **Pro gate.** One check in one place (product rule 7), next to the other Pro gates. A free lifter, including after a refund (owner decision 2026-11-25: the form opens for everyone, only the save button is gated):
   - can open New exercise from the **+** and the "Create" row (the row keeps its grey "Pro" tag) and fill in the whole form, but the bottom button reads **Unlock Pro** (lock icon) instead of "Save exercise", and opens the Paywall. Nothing is saved. The typed values stay on the screen, and if Pro switches on the button becomes Save exercise;
   - keeps every custom exercise in routines, workouts, history, Progress and the pickers;
   - sees the same on Edit: "Unlock Pro" replaces "Save changes". Delete stays allowed.
   A Pro lifter sees Save exercise and Save changes.
10. **Entry points.** **+** in the Library header (Library tab only). The "Create “{search}”" row under the no-match card, in the Library and the routine picker (shared `ExerciseBrowser`), pre-fills the Name with the search text. The routine picker has no **+**.
11. **After Save.** Return to where the lifter started. From the picker: back in the picker with the new exercise picked and its setup open. From the Library: the list with the new exercise visible. Cancel returns to where they started.

## Code notes
- Migration: `routine_exercises.exercise_id`, `workout_exercises.exercise_id` and `sets.exercise_id` become `ON DELETE CASCADE`. SQLite needs a table rebuild for this; check drizzle's output and the migration test. Library exercises are never deleted.
- Delete runs in one transaction: delete the exercise (the cascade does the rest), then delete workouts that no longer have a Workout exercise.
- Reminders, Today and the routine list read routine exercises, so they refresh after a delete. A routine left with no exercises stays (the lifter may add more).
- Name check is a pure function with tests (library name, custom name, case, spaces, own name on Edit). So are the Equipment-switch rule and the step list rules.
- Seed: custom rows have `slug = null`, `is_custom = true`.
- The Settings dev "Pro source" switch (Free) must show the Unlock Pro button on New exercise and on Edit of an existing custom exercise.

## Design changes (canvas)
- `ExerciseNew` and `ExerciseEdit`: remove "How you track it". Replace the "How to do it" textarea with the step boxes. Add the step boxes to Edit. Show the disabled Bodyweight state on Edit.
- `ExerciseDelete`: the new warning text, with the routine names. Add a "blocked by a workout in progress" state.
- `ExerciseNew` and `ExerciseEdit`: a free state where the bottom button is **Unlock Pro** with a lock icon.
- `LibraryEmpty`: no change for free lifters (the **+** has no lock; the Pro tag on the Create row is already there).
- Wire the Edit button on a custom exercise to `ExerciseEdit` (a known linking gap).

## Out of scope
Time tracking, charts (4), plate calculator (5), backup (6 and 7), export (8), a custom-exercise filter in the Library.
