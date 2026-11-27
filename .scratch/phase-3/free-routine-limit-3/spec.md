# Free routine limit 3: spec

**Status:** ready-for-agent

An extra Phase 3 ticket (owner decision 2026-11-27, while grilling Phase 4), built on its own branch from `main` and finished before Phase 4 feature 3 (plan generator). Ticket: `issues/01` to `03`.

## Problem Statement

A free lifter can keep only 2 routines. That is too few for a normal split, and it blocks the Phase 4 starter plan: a lifter who trains 5 or 6 days a week should get Push, Pull and Legs, which is 3 routines. Today the app would either lock the third routine the moment onboarding ends or never offer the split.

## Solution

Free lifters can have up to 3 routines. Everything that talks about the limit says 3: the limit pop-up, the counter on the Routines tab, the Paywall row and the Locked routine rule. Pro still lifts the limit to unlimited. The number lives in one place and all copy reads from it, so it can never drift again.

## User Stories

1. As a free lifter, I want to create a third routine, so that I can run a three-day split without paying.
2. As a free lifter, I want the fourth routine to be blocked by the limit pop-up, so that I understand where free ends.
3. As a free lifter with 3 routines, I want the pop-up to say "You've used your 3 free routines", so that the number matches what I have.
4. As a free lifter, I want the pop-up to keep its See Pro and Not now buttons and its Paywall pitch, so that nothing about the upgrade path changes.
5. As a free lifter with 1 routine, I want the Routines counter to read "1 of 3 free routines used", so that I know how many I have left.
6. As a free lifter with 3 routines, I want the counter to read "3 of 3 free routines used", so that I know I am at the limit.
7. As a Pro lifter, I want the counter to read "N routines" with no limit, so that Pro looks the same as before.
8. As a free lifter opening the Paywall, I want the Routines row to read "3" against "Unlimited", so that the table is true.
9. As a lifter whose Pro was refunded with 5 routines, I want only the routines past my 3 oldest to lock, so that I keep the most I am allowed.
10. As a lifter whose Pro was refunded with exactly 3 routines, I want nothing to lock, so that a refund costs me nothing I am allowed to keep.
11. As a lifter whose Pro was refunded with 4 routines, I want only the newest routine to lock, so that my first three keep working.
12. As a lifter with a Locked routine, I want deleting one of my 3 oldest routines to unlock the next one, so that I can free a slot by deleting.
13. As a lifter with Locked routines, I want buying or restoring Pro to unlock them all, so that Pro works as before.
14. As a lifter with Locked routines, I want the Routines card to keep reading "N routines locked. Unlock Pro to use them again.", so that its meaning is unchanged.
15. As a lifter, I want a Locked routine to stay out of Today and Reminders, so that I am never nudged to do something I cannot start.
16. As a lifter with a Workout in progress on a routine that locks after a refund, I want to finish it completely, so that no work is lost.
17. As a lifter who reorders routines, I want the 3 that stay open to be the 3 oldest by creation, not the first 3 in the list, so that dragging a routine never locks another.
18. As a lifter, I want the oldest-3 rule to survive deleting and re-creating routines, so that a new routine never takes an older one's place.
19. As a lifter with an existing install of 2 routines, I want nothing to change on update, so that the new limit only gives me room.
20. As the owner, I want the limit number to be set in one place, so that changing it again later changes every screen and string together.
21. As the owner, I want a test that fails if any copy still shows an old number, so that stale text cannot ship.
22. As the owner, I want the docs, glossary and rules to say 3, so that the next feature reads the right limit.

## Implementation Decisions

- The free limit is a single constant in the routine limit module, set to 3. It is the only place the number lives (Pro limits in one place, product rule 7). Both `canCreateRoutine` and `lockedRoutineIds` already read it, so the behavior change needs no new logic.
- The Locked routine rule is unchanged except for the number: the 3 lowest ids (creation order, ids never reused) stay open without Pro, whatever order the list shows. Worked out on read, never stored.
- Copy that has the number typed in becomes copy built from the constant: the limit pop-up title, the Routines counter (strong part "N of 3" and the "free routines used" part), the Paywall's Routines row (free column) and the gallery line. The Paywall table keeps its "Unlimited" Pro value.
- No schema change and no migration. Nothing stored holds the limit, and existing installs with 0 to 2 routines are unaffected.
- No new screens and no layout change. The limit pop-up, the counter card and the Locked routine row keep their current design on the canvas; only their text changes. The canvas frames that show "2" (the limit pop-up, the Routines counter, the Paywall row) are edited by the owner, not by this work.
- Docs change in the same branch: the glossary entry for Locked routine, the Pro table and refunds line in the product doc, the decisions log (a new entry with the owner decision of 2026-11-27 and its why: PPL needs 3 routines), the screens doc rows that say 2, the product rules file (rule 7), and the positioning doc if it says 2.
- No ADR: easy to reverse, nothing stored, no surprise to a future reader.

## Testing Decisions

- A good test checks behavior through the pure functions and the text they produce, never a screen or a stored value. No test mocks a database or the store.
- The one seam is the existing pure routines module: the routine limit functions and the pure text and state builders that read the constant (routine list state and text, limit sheet text, the Paywall row text).
- Cases to cover:
  - the 3rd routine is allowed and the 4th blocked without Pro; any count is allowed with Pro;
  - with 3, 4, 5 routines and no Pro, exactly the ids past the 3 lowest are locked, whatever order the ids are given;
  - deleting an older routine unlocks the next one; Pro unlocks all;
  - the counter reads "N of 3" for N = 0 to 3 without Pro, and "N routines" with Pro;
  - the limit pop-up title reads "3 free routines";
  - every copy builder includes `String(FREE_ROUTINE_LIMIT)`, so a future change cannot leave a stale number.
- The mid-workout refund test (a workout on a routine past the oldest) is updated to the new number and must still pass: the workout finishes completely.
- Prior art: the existing Jest tests beside the routine limit, routine list state, routine list text and limit sheet text modules, and the refund-mid-workout test. Update their numbers rather than adding a new style.
- Run `npx tsc --noEmit`, `npx expo lint` and the Jest suite before calling it done. The owner checks the pop-up and a lock on a phone.

## Out of Scope

- Any other change to Pro or to what Pro unlocks.
- The starter plan generator and onboarding (Phase 4 features 1 to 4); this only makes room for them.
- Moving the limit to a setting, per-store tuning or a remote value (the app is offline only).
- Redrawing the canvas frames, or changing the Paywall, pop-up or counter design.
- Any change to how Locked routines look or behave beyond the number.

## Further Notes

- Why 3 and not 2: push/pull/legs is 3 routines and the starter plan must fit within the free limit without locking its own third routine (grilling 2026-11-27, Phase 4 Q3, owner chose to raise the limit rather than drop PPL or lock the third routine).
- The copy in the glossary, product doc and rules must say 3, so features written after this one read the right number.
- `docs/agents/rules/product.md` lists the free routine limit as an open item for the owner to decide; this spec records that the owner has decided: 3.
