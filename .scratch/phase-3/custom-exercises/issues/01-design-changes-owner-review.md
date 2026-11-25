# 01: Design changes, owner review first

**What to build:** The canvas shows what will be built before any screen is coded. The agent proposes the changes, the owner reviews them, and only then are the boards edited.

**Blocked by:** None (can start immediately)

**Status:** built

**Review gate:** Do not modify the design canvas until the owner has approved the written proposal below. Ask for review first, wait for the answer, then edit.

- [x] A written proposal is posted to the owner before any canvas edit: for each board, what changes and why, with an ASCII sketch of the step-box block and the Delete warning (spec, "Design changes").
  - `ExerciseNew` and `ExerciseEdit`: no "How you track it"; the "How to do it" textarea becomes step boxes (1 badge, remove x, "+ Add step", 10 steps and 200 characters at most); Edit gets the block too; Edit shows the disabled Bodyweight chip state with its note.
  - `ExerciseDelete`: the warning text naming the routines, "history is deleted for good and can't be recovered", plus a state blocked by a Workout in progress.
  - `ExerciseNew` and `ExerciseEdit`: a free state where the bottom button is **Unlock Pro** with a lock icon, instead of Save.
  - `LibraryEmpty`: no change for free lifters (the **+** stays as drawn; the Pro tag on the Create row is already there).
- [x] The owner approves, or asks for changes, before any board is edited.
- [x] After approval, the boards are edited on the canvas as approved, and nothing else on the canvas changes.
- [x] The Edit button on a custom exercise is linked to `ExerciseEdit` (a known linking gap in `docs/screens.md`, which is then updated).

## Result
Owner approved the written proposal and the preview on 2026-11-25; the canvas was edited after that (version 84). New boards: `ExerciseCustom` (custom exercise detail with the Edit button), `ExerciseNewFree` and `ExerciseEditFree` (Unlock Pro in place of Save) and `ExerciseDeleteBlocked`. Changed: `ExerciseNew`, `ExerciseEdit` (equipment used: Bodyweight disabled with its note), `ExerciseDelete`. The name-clash message is in the spec and the preview, not a separate board. `LibraryEmpty` is unchanged.
