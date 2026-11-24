# Phase 3 · Feature 2 · Routine limit upgrade: spec

Status: ready to build, grilled 2026-11-24 (owner decisions below). Needs: feature 1 (the `isPro` gate).
Design (on the canvas, https://claude.ai/artifact/Ny2LFGjeieuBmcCGHeGb7e): `RoutinesLocked`, `RoutineLockedPro`, and the edited `RoutineLimit` ("2 free routines used (limit pop-up)"). The old `RoutineLocked` board is now titled "read-only during a workout" (blocked by a Workout in progress, not a Pro lock).

## What the lifter gets
1. The limit pop-up pitches Pro and opens the Paywall.
2. Pro lifts the limit of 2 routines. The counter changes with it.
3. After a refund, routines past the 2 oldest become **Locked routines** (see `GLOSSARY.md`).

## Decisions
1. **Which routines lock.** The 2 lowest `id` (creation order; ids are autoincrement and never reused) stay open. Reordering never changes it, and a locked routine keeps its list position. The lock is worked out on read from the routines' ids and `isPro`. It is never stored. The rule lives in `src/routines/routineLimit.ts` beside `FREE_ROUTINE_LIMIT` (product rule 7). Deleting an older routine unlocks the next one. Buying or restoring Pro unlocks all.
2. **Routines tab, free, nothing locked.** As today ("N of 2 free routines used" with the meter).
3. **Routines tab, any routine locked.** The counter card becomes "**N routines locked.** Unlock Pro to use them again.", with a lock icon and a chevron, no meter, and a tap opens the Paywall. With Pro there is no card, only the plain count as today.
4. **Locked row.** Same card, the title, summary and days line at about 50% opacity, a lock icon and the grey "Pro" tag (same as Progress "See all records") on the title row at full strength. The days line stays. Tap opens the locked screen.
5. **Locked routine screen.** The routine screen is read-only: a lavender banner "{Name} is locked. Unlock Pro to start or edit it.", no Start workout button, name, days and exercise rows dimmed and not tappable (no setup sheet), Reorder and Add exercise disabled. The bottom button, where Done is on other routine screens, is **Unlock Pro** with a lock icon (opens the Paywall). The ⋯ menu stays enabled with **Delete routine** only (same confirm sheet and text as today, ADR 0002).
6. **Today and Reminders.** Locked routines are left out entirely: a day with only a locked routine is a normal rest day, with no nudge. No reminder is scheduled for them. The Reminders settings note counts open routines only. Nothing else explains a lock but the Routines tab.
7. **Workout in progress when the lock lands.** A workout started before the lock finishes completely, including Offers that write new Targets. Locked blocks starting and manual editing only.
8. **Limit pop-up.** Title "You've used your 2 free routines". Body "Get unlimited routines with Pro. One payment, yours forever." (no mention of deleting). The 3-tick benefit card, button **See Pro** (opens the Paywall), link **Not now**. The benefit card lists later-feature items, so its wording follows whatever the Paywall table says.
9. **After buying from the pop-up.** The lifter returns to the Routines tab, with no remembered intent. They tap **+** again. The Routines tab and `+` read `useIsPro()`, so both update as soon as the store answers.

## Code notes
- `isRoutineLocked` in `src/workout/routineLock.ts` means "blocked by a Workout in progress". Rename it to `isBlockedByWorkout` (the glossary reserves "locked" for the Pro lock).
- `canCreateRoutine` stays. Add a pure function that returns the locked ids from the routines' ids and `isPro`, with tests (3 routines free → 1 locked; reorder doesn't change it; delete an older → next unlocks; Pro → none).
- Guards: `/routines/new` keeps its fresh-count check. `useStartWorkout` refuses a locked routine as a backstop (shows the Paywall), in case a refund lands between render and tap.
- The dev "Pro source" switch (Free) must show locks on a phone with 3 or more routines, so locks can be tried without a refund.

## Out of scope
Custom exercises (3), charts (4), plate calculator (5), backup (6 and 7), export (8).
