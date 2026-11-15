# 02: Database opens and migrates on launch

**What to build:** When the lifter opens the app, it opens its local database and applies the first migration, and the splash screen stays up until that is done. A failed migration shows a clear error and not a blank screen.

**Blocked by:** None for the code, but the owner must approve the schema first (the first migration is frozen once approved).

**Status:** ready-for-agent

- [ ] Owner has approved the schema
- [ ] The first migration creates every table, including the workout exercises table and the exercise load type
- [ ] The app applies pending migrations on start and holds the splash screen until they finish
- [ ] A migration failure is shown to the user and does not crash
- [ ] The app opens on an iPhone and an Android phone in Expo Go with the database ready (owner checks on device)
- [ ] An export for iOS and Android succeeds (Metro resolves the migration files)
- [ ] Type check, lint and Jest all pass
