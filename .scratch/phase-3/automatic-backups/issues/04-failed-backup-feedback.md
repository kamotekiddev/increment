# 04: Failed backup feedback

**What to build:** When an automatic backup cannot be written (folder deleted or revoked, full phone), the lifter gets one "Automatic backup couldn't save. Your last backup was {date}." alert (Fix it opens the screen / Later) per failure streak, plus a status line on the screen. It never blocks Finish or launch, later triggers retry quietly, and a success clears the streak.

**Blocked by:** 03

**Status:** resolved

- [x] Failure sets a streak flag once; the alert shows only when the flag goes from clear to set.
- [x] Status line "Last backup {date} · Couldn't save: folder unavailable" on the screen.
- [x] Unit tests for the streak logic; type check, lint and tests pass.
