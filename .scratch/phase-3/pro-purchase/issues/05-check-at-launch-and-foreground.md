# 04: Check the store at launch and on return to the app

**What to build:** Wire `refresh()` to the real adapter at the moments ADR 0004 sets, so refunds and hand edits are undone and pending purchases complete by themselves.

**Blocked by:** 04

**Status:** ready-for-agent

- [ ] `refresh()` runs once the database is ready and each time the app returns to the foreground, in the existing `AppState` effect in `src/app/_layout.tsx`. Screens never wait on it: they draw from the loaded row first.
- [ ] The purchase update and error listeners are set up once at the root. A purchase update triggers `refresh()`, so a pending purchase that completes while the app is open turns Pro on.
- [ ] A definite "not owned" turns Pro off; no answer changes nothing (covered by ticket 01's tests).
- [ ] Type check, lint and tests pass.
