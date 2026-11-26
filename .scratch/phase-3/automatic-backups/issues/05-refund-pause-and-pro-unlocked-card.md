# 05: Refund pause and Pro unlocked card

**What to build:** After a refund nothing runs and the Your data row locks again, while settings and written files stay; buying Pro again resumes as before. Pro unlocked shows a "Turn on automatic backups" card ("Recommended first step. Takes 10 seconds.") that opens the Automatic backups screen.

**Blocked by:** 02

**Status:** resolved

- [x] Automatic writes read the one Pro gate; no write while not Pro; no pruning while not Pro; settings untouched.
- [x] The Pro unlocked card opens the screen and the "no card yet" note in `docs/screens.md` is replaced.
- [x] Type check, lint and tests pass.
