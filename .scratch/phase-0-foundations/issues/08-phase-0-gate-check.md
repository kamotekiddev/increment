# 08: Phase 0 gate check

**What to build:** Proof that the Phase 0 gate is met: the app opens on both phones, and the engine passes every rule.

**Blocked by:** 03, 05, 06, 07

**Status:** automated checks pass; owner device check on iPhone and Android pending

- [x] Type check, lint and Jest all pass
- [x] An export for iOS and Android succeeds, and `expo-doctor` reports no problems
- [ ] The owner opens the app in Expo Go on an iPhone and an Android phone and sees the tabs, the theme and the seeded library
- [x] Every rule in the spec has a passing test
- [x] Anything built that belongs to a later phase is removed, per the roadmap gates

## Notes
- 65 Jest tests, `tsc`, lint, `expo-doctor` (20/20) and the iOS and Android export all pass.
- Seen working on the iPhone 16 Pro simulator: theme, tabs, gallery, migration and the seeded library (178 exercises). Android and a real iPhone are still to be checked by the owner.
