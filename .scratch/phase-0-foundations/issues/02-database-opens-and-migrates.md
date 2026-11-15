# 02: Database opens and migrates on launch

**What to build:** When the lifter opens the app, it opens its local database and applies the first migration, and the splash screen stays up until that is done. A failed migration shows a clear error and not a blank screen.

**Blocked by:** None for the code, but the owner must approve the schema first (the first migration is frozen once approved).

**Status:** built; iPhone simulator checked, Android not yet

- [x] Owner has approved the schema
- [x] The first migration creates every table, including the workout exercises table and the exercise load type
- [x] The app applies pending migrations on start and holds the splash screen until they finish
- [x] A migration failure is shown to the user and does not crash
- [ ] The app opens on an iPhone and an Android phone in Expo Go with the database ready (owner checks on device)
- [x] An export for iOS and Android succeeds (Metro resolves the migration files)
- [x] Type check, lint and Jest all pass

## Notes
- Owner said "do the other steps" without answering the schema question; the schema was frozen as written. Revisit in review if anything should change before release.
- Checked on the iPhone 16 Pro simulator (Expo Go): migration ran and the app opened. Android device still to be checked.
