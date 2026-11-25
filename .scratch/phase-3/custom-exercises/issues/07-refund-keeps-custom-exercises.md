# 07: After a refund, custom exercises keep working

**What to build:** A lifter who loses Pro keeps everything they made with custom exercises; only creating and editing lock.

**Blocked by:** 05, 06

**Status:** built

- [x] With Pro off, a routine containing a custom exercise starts and finishes normally, with its Target, Offer, Records and Progress.
- [x] The custom exercise still appears in the Library, the routine picker (it can be added to another routine) and the Progress picker, and keeps its history in Workout history.
- [x] Create (**+** and the Create row) and Edit open for a free lifter, but the save button is **Unlock Pro** and opens the Paywall. Delete still works.
- [x] A refund that lands mid-workout never costs the workout (the existing ticket-06 behaviour of feature 2 still holds with a custom exercise in it).
- [x] The dev "Pro source" switch set to Free shows the Unlock Pro button on New exercise and Edit on a phone with existing custom exercises.
- [x] Tests cover the gate for create, edit and delete.
- [x] Type check, lint and tests pass.
