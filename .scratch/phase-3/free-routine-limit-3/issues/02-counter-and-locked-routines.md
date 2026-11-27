# 02: Counter and Locked routines follow the 3-oldest rule

**What to build:** The Routines tab counter and the Locked routine rule use 3. The counter reads "N of 3 free routines used" for a free lifter and "N routines" for a Pro lifter. After a refund, only routines past the 3 oldest (by creation, whatever order the list shows) lock; deleting an older routine unlocks the next one; buying or restoring Pro unlocks them all; a Workout in progress on a routine that locks can be finished completely. Spec: `../spec.md`.

**Blocked by:** 01

**Status:** resolved

- [x] The counter reads "N of 3 free routines used" for N = 0 to 3 without Pro and "N routines" with Pro, built from the constant.
- [x] Without Pro, with 3, 4 and 5 routines in any list order, exactly the ids past the 3 lowest are locked (none with 3, the newest with 4, the 2 newest with 5); Pro locks none.
- [x] Deleting one of the 3 oldest unlocks the next routine; the "N routines locked. Unlock Pro to use them again." card is unchanged.
- [x] The mid-workout refund test (a workout on a routine that locks after a refund) uses the new numbers and still finishes the workout completely.
- [x] A drift test checks that every piece of limit copy (pop-up, counter, Paywall row) contains the constant's value.
- [ ] `npx tsc --noEmit`, `npx expo lint` and the Jest suite pass; the owner checks the counter and a lock after a refund on a phone. (phone check left unticked for the owner; the automated checks pass)

## Comments
