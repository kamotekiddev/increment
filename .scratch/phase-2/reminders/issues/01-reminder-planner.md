# 01: Reminder planner and text

**What to build:** The pure rules behind reminders, with no I/O: which dates in the next 4 weeks get a reminder, at what local time, with what title and body, and the days note shown in Settings. Tickets 02 to 05 only call it.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A planner takes the Routines (name, days bitmask with Monday = bit 0, exercise count, in Routines-tab order), whether a Workout was started today, the reminder time (minutes after local midnight) and `now`, and returns the reminders for today and the next 27 days: a stable id `reminder-YYYY-MM-DD`, a local date-time, a title and a body
- [ ] A day with no planned Routine gets none. Today is skipped when its time has passed or a Workout was started today. The rest of the window does not depend on that flag
- [ ] Title: `<A> today`, `<A> and <B> today`, `<A>, <B> and <C> today`, in Routines-tab order
- [ ] Body with one Routine: `N exercises planned`, `1 exercise planned`, or `No exercises yet`. With two or more Routines: `N workouts planned`
- [ ] Days note text from the Routines: three-letter names Sunday first joined with ", " (`Mon, Tue, Thu, Fri`), `Every day` for all seven, or null when no Routine has days. Reuses `src/routines/routineDays.ts`
- [ ] Jest, with a fixed `now`:
  - Push day A Mon/Thu and Pull day B Tue/Fri at 18:00, `now` Sunday noon: 16 reminders, only on Mon, Tue, Thu and Fri, each at 18:00 local
  - Today planned at 17:59 is included. At 18:00 or later it is skipped. A Workout started today skips it
  - Two and three Routines on one day
  - The three body counts, and no Routine days giving no reminders
  - The ids are stable
  - A date across a DST change keeps 18:00 local
  - The days note cases
- [ ] Type check, lint and tests pass
