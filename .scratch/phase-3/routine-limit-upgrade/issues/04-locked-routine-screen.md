# 04: Locked routine screen

**What to build:** Opening a Locked routine shows it read-only with a way to unlock, and it can still be deleted.

**Blocked by:** 01, 03

**Status:** built

- [x] The routine screen for a locked routine matches the `RoutineLockedPro` canvas board: banner "{Name} is locked. Unlock Pro to start or edit it.", no Start workout button, name, days and exercise rows dimmed and not tappable (no setup sheet), Reorder and Add exercise disabled.
- [x] The bottom button is **Unlock Pro** with a lock icon and opens the Paywall (it replaces Done).
- [x] The ⋯ menu stays enabled with **Delete routine** only, using the existing confirm sheet and text (ADR 0002).
- [x] Deleting an older routine unlocks the next one; buying or restoring Pro unlocks all. The screen and the Routines tab update without a restart.
- [x] Starting a workout on a locked routine is refused wherever it is asked (a refund can land between render and tap), and the Paywall opens instead.
- [x] Type check, lint and tests pass.
