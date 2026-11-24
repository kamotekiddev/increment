# 05: Today and Reminders skip locked routines

**What to build:** Locked routines never appear in the plan or in notifications.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Today leaves locked routines out: a day with only a locked routine is a normal rest day, with no nudge and no locked card. The next-routine preview uses open routines only.
- [ ] No reminder is scheduled for a locked routine, and the schedule refreshes when the lock changes (refund, purchase, restore, delete).
- [ ] The Reminders settings note about days with a routine counts open routines only.
- [ ] Jest covers the planning and Today input with and without locked routines.
- [ ] Type check, lint and tests pass.
