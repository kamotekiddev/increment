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
- **Free routine limit**: 2. Adding a third shows the limit pop-up.
- **Routines**: deleting a routine deletes its workouts, and Target history is per routine; see [ADR 0002](adr/0002-deleting-a-routine-deletes-its-workouts.md).
- **Visual direction**: minimal light UI, neutral base, purple accent `#5B3DF5`, Sora font.
- **UI components**: Text and Button are plain React Native on our tokens, because `@expo/ui` Text ignores custom fonts on iOS and its Button draws a system blue box (checked in the Phase 0 spike). `@expo/ui` is used for the bottom sheet, switch and picker.
- **Phase 1 Jump**: one fixed 2.5 kg for every exercise, in one constant, until the Phase 2 Jump setting replaces it.
- **Live workout**: saved from Start, one in progress at a time, and its routine is locked until it is finished or discarded; see `.scratch/phase-1-live-workout/spec.md`.
- **Live workout inputs**: weight and reps are typed into plain number inputs. There are no −/+ weight buttons (built, then removed because the owner did not like the interface), no Add set and no remove-set control: the set count is fixed to the plan. A set cannot be marked done while its weight is blank.
- **Offer and summary**: after Finish, each Earned exercise gets its own Offer screen with only Go up and Stay, one at a time, then a summary reports the result with no buttons. A tap saves at once and is final; back and swipe are disabled on Offer screens; unanswered Offers are Stay. A grouped list, "go up on all", a compact card and flipping an answer were sketched and set aside. See `.scratch/phase-1-summary-and-offer/spec.md`.
- **Week start**: the week starts on Sunday in every day row, with three-letter names (Sun, Mon, Tue) (the "Repeat on" picker, the onboarding schedule and the Today week strip), like a calendar. Days are still stored as a bitmask with Monday = bit 0; only the display order changes.
- **Today**: one Routine shows at a time as a swipeable deck (the lifter does one routine per session); a rest day has no Start ("Train anyway", "Start an empty workout", ready-made plans and a week number from the design were left out, the settings gear arrives in Phase 2); a workout belongs to the day it was started, in local time. See `.scratch/phase-1-today/spec.md`.
- **Rest timer**: one timer, started by marking a set done and held as an end time; a buzz at zero and a local notification in the background; -15s and +15s change that rest only; the permission is asked once at the first rest until Phase 4 onboarding asks. See `.scratch/phase-1-rest-timer/spec.md`.
- **Crash resume**: a cold launch reopens the workout in progress (last edit within 12 hours) on its first exercise with an open set; the rest timer and the "edited" row marks are saved so a restart behaves like none. Offers and the summary are not resumed. See `.scratch/phase-1-crash-resume/spec.md`.

## Open
- [ ] Android: do rest-over notifications arrive on time without the exact-alarm permission? Unverified; owner checks on a phone, and if late, decides whether to request the permission (a Play policy question)
- [ ] Pro price and currency for each store
- [ ] Confirm "Increment" is available in both stores and as a trademark
- [ ] Owner review of the curated library list (178 exercises, `src/db/library/exercises.json`)
