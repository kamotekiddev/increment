# Decisions

## Decided
- **Name**: Increment (formerly "Overload"; that name is taken in the stores).
- **Platform**: iOS and Android, built with Expo (React Native).
- **Offline, no account, no backend.**
- **Monetization**: a one-time Pro unlock with no subscription.
- **Backups are Pro-only**; restore is offered during onboarding for returning customers.
- **Units**: a global kg/lb preference; weights are stored in kg and converted for display only.
- **Exercise library source**: a curated subset (178 exercises at the start of Phase 0) of the public-domain [free-exercise-db](https://github.com/yuhonas/free-exercise-db) (Unlicense), text instructions only, with a load type on each exercise.
- **Weights**: stored in kg as full-precision numbers; see [ADR 0001](adr/0001-weights-stored-in-kg.md).
- **Progression**: earned after N clean workouts in a row (default 3); the lifter chooses whether to accept the step. Pro unlocks the step, N, miss handling and deload.
- **Visual direction**: minimal light UI, neutral base, purple accent `#5B3DF5`, Sora font.
- **UI components**: Text and Button are plain React Native on our tokens, because `@expo/ui` Text ignores custom fonts on iOS and its Button draws a system blue box (checked in the Phase 0 spike). `@expo/ui` is used for the bottom sheet, switch and picker.

## Open
- [ ] Pro price and currency for each store
- [ ] Confirm "Increment" is available in both stores and as a trademark
- [ ] Free routine limit: 3 (friendlier) or 2 (more upgrades)
- [ ] Owner review of the curated library list (178 exercises, `src/db/library/exercises.json`)
