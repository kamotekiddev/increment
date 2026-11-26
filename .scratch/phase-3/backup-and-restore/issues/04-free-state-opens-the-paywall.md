# 04: Free state opens the Paywall

**What to build:** A free lifter sees Create backup locked, can buy Pro from it and comes back to a working button.

**Blocked by:** 03

**Status:** resolved

- [x] A free lifter sees "Unlock backups with Pro"; tapping it opens the Paywall.
- [x] After buying, the lifter lands back on Your data with Create backup unlocked; nothing starts by itself.
- [x] After a refund the button is locked again; existing files and the Restore row are unaffected.
- [x] The Pro check lives in the one Pro-gate place, with no scattered `isPro` checks.
- [x] Type check, lint and tests pass.
