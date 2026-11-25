# 01: Design changes, owner review first

**What to build:** The canvas shows what will be built before any screen is coded. The agent proposes the changes, the owner reviews them, and only then are the boards edited.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

**Review gate:** Do not modify the design canvas until the owner has approved the written proposal below. Ask for review first, wait for the answer, then edit.

- [ ] A written proposal is posted to the owner before any canvas edit: for each board, what changes and why, with an ASCII sketch of the step-box block and the Delete warning (spec, "Design changes").
  - `ExerciseNew` and `ExerciseEdit`: no "How you track it"; the "How to do it" textarea becomes step boxes (1 badge, remove x, "+ Add step", 10 steps and 200 characters at most); Edit gets the block too; Edit shows the disabled Bodyweight chip state with its note.
  - `ExerciseDelete`: the warning text naming the routines, "history is deleted for good and can't be recovered", plus a state blocked by a Workout in progress.
  - `LibraryEmpty`: the free lock on **+** (the Pro tag on the Create row is already there).
- [ ] The owner approves, or asks for changes, before any board is edited.
- [ ] After approval, the boards are edited on the canvas as approved, and nothing else on the canvas changes.
- [ ] The Edit button on a custom exercise is linked to `ExerciseEdit` (a known linking gap in `docs/screens.md`, which is then updated).
