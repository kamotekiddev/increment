Status: ready-for-agent

# Phase 1 · Feature 4 · Summary and Offer

Part of Phase 1 (see `.scratch/phase-1-core-training-loop/map.md`). Needs: Live workout core (feature 3). Decisions below come from a grilling session on 2026-11-17.

## Problem Statement

The lifter finishes a workout and lands back where they started, with no sign of how it went. They cannot see their volume, whether each exercise was Clean, Held or Missed, or what weight and reps they will be asked to hit next time. When progression is Earned, the app has a stepped-up Target ready, but nowhere to ask whether the lifter wants it.

## Solution

Finish saves the workout and then opens a summary screen. It shows the workout's duration, sets and volume, and one card per exercise with done sets. Each card says how the exercise went and shows the next Target. When progression is Earned, the card carries an **Offer** with Accept and Decline. Accept makes the stepped-up Target the next Target; Decline keeps the current one. Done returns to where the workout started.

## User Stories

1. As a lifter, I want the summary to open right after I confirm Finish, so that I see how the workout went straight away.
2. As a lifter, I want the workout saved and its routine unlocked before the summary shows, so that nothing is lost if I leave or the app is killed.
3. As a lifter, I want the summary to show how long the workout took, so that I know my session length.
4. As a lifter, I want the summary to show how many sets I did, so that I can see the work I put in.
5. As a lifter, I want the summary to show total volume in kg (done working sets, weight × reps), so that I can see how much I lifted.
6. As a lifter who did only bodyweight exercises, I want total reps shown in place of volume, so that the header never reads "0 kg".
7. As a lifter, I want bodyweight sets to add 0 to volume and weighted bodyweight sets to count their added load, so that volume matches what I lifted.
8. As a lifter, I want one card per exercise I did, so that I can read each result separately.
9. As a lifter, I want exercises I skipped left off the summary, so that skipping does not look like a failure.
10. As a lifter, I want each card to say whether the exercise was Clean, Held or Missed, so that I understand the result.
11. As a lifter, I want a Clean card to show my Streak progress (for example "2 more at 60 kg × 10 to earn 62.5 kg"), so that I know how close the next step is.
12. As a lifter, I want a Hold card to say my Streak restarts and the Target stays, so that I know what a Hold means.
13. As a lifter, I want a Miss card to show the next Target, including any drop the exercise's miss rule applies, so that I am not surprised next time.
14. As a lifter whose workout was the first one for an exercise, I want the card to say a baseline was set and show the next Target from what I logged, so that I get a Target for next time.
15. As a lifter at the top of my rep range with no step to offer, I want the card to say so, so that I know why nothing went up.
16. As a lifter on a Deload workout, I want the card to say it does not count toward my Streak, so that a light day does not worry me.
17. As a lifter, I want every card to show the next Target as weight × reps, so that I know what to hit next time.
18. As a lifter, I want an Offer on the card when progression is Earned, so that I can choose to move up.
19. As a lifter, I want the Offer to show the stepped-up Target (for example 62.5 kg × 10), so that I know exactly what I am accepting.
20. As a lifter, I want Accept to make the stepped-up Target my next Target, so that I progress.
21. As a lifter, I want Decline to keep my current Target, so that I can stay where I am when I am not ready.
22. As a lifter, I want a declined Offer to come back after my next Clean workout, so that I am not asked again straight away.
23. As a lifter, I want my Accept or Decline saved the moment I tap, so that an app kill on the summary loses nothing.
24. As a lifter, I want to flip between Accept and Decline until I leave the summary, so that a mis-tap is not final.
25. As a lifter, I want the card to update the next Target as soon as I tap, so that I see the effect of my choice.
26. As a lifter, I want leaving without answering an Offer to count as Decline, so that I am never trapped on the summary.
27. As a lifter, I want back and swipe to act like Done, so that every way out behaves the same.
28. As a lifter, I want my answer to be final once I leave the summary, so that the next Target I was shown stays the Target I get.
29. As a lifter, I want a killed app to reopen on the normal tab, so that I am not stuck in a half-finished flow.
30. As a lifter, I want the Finish prompt to work as before (unchecked sets, skipped exercises, no sets done), so that the new summary does not change how I finish.
31. As a lifter, I want the summary to show no records, so that it only says what this workout did. Records arrive in Phase 2.
32. As a lifter, I want the summary to use the same Target the next workout will show, so that the two never disagree.
33. As the developer, I want an exercise's next Target to come from the existing engine, so that the rules live in one place.

## Implementation Decisions

**Flow**
- Finish saves as it does today (`finished_at` set, `in_progress` false, routine unlocked), then replaces the live workout screen with the summary for that workout. Back, swipe and the Android back button act as Done and return to where the workout started.
- The summary is shown once. It cannot be reopened later; if the app is killed on it, the lifter reopens to the normal tab. A reopenable summary belongs to crash resume (feature 7) and exercise history (Phase 2).
- The Finish prompts, Discard and the one-workout-at-a-time rule are unchanged.

**Header**
- Duration (finished minus started, in whole minutes), sets (done working sets across the workout), and volume (sum of weight × reps over done working sets, in kg).
- Volume at 0 (only bodyweight sets) is replaced by total reps. The header never reads 0 kg.
- Weights stay kg until the Phase 2 unit switch.

**Cards**
- One card per exercise with at least one done set, in workout order. Skipped exercises are left out.
- Each card shows the outcome, one short line chosen from the engine's reason, and the next Target (weight × reps). The Streak count appears only on Clean cards.
- Wording is derived from the engine's reason codes and outcome. The engine itself is not changed.

**Offer**
- Shown on a card only when the engine returns a proposal (progression Earned). It shows the proposed Target with Accept and Decline.
- Tapping Accept or Decline writes `progress_accepted` on that Workout exercise at once and re-reads the next Target from the engine. Tapping the other flips it back. The card shows the Target that results.
- No answer means `progress_accepted` stays false, which is a Decline. No pending state is stored.
- Both answers lock when the lifter leaves the summary.

**Data**
- No schema change. `progress_accepted` already exists on workout exercises and is false from Start; this feature is the first to set it.
- The next Target is the engine's result over the exercise's history by routine (ADR 0002), with this workout and its `progress_accepted` included.

**Pure functions** (no I/O, tested): the summary builder described under Testing Decisions, and the card-line wording from reason and outcome.

**Screens**
- Workout summary screen: header card, a card list, Done button. The design canvas frame `TrainSummary` differs from these decisions, and the decisions win:
  - It has a records section; records are out of scope (Phase 2).
  - It lists "Goes up next time" as read-only chips; here the Offer has Accept and Decline.
  - It has "How did it feel?"; notes and feel are out of scope.
  - It has a Share button; sharing is out of scope.
- The canvas frame is updated locally and published only when the owner asks.

## Testing Decisions

- A good test checks external behaviour: given a finished workout and history, what the summary says. It does not check how the builder is structured.
- One seam: the summary builder, a pure function over plain inputs (the done sets, the Target shown, the plan, the rule, the load type, the exercise's history including this workout, the Jump, and the start and finish times). It returns the header and the cards, each with outcome, reason, next Target and an optional Offer.
- Example tests: Clean 1 of 3; Earned with an Offer; Accepted shows the stepped Target; Declined keeps the Target; Hold; Miss, with and without a miss-rule drop; first-workout baseline; top of range with no Offer; Deload; a skipped exercise left out; volume with bodyweight and weighted-bodyweight sets; an all-bodyweight workout showing total reps.
- Not unit-tested: the Accept and Decline database write, navigation after Finish, and the screen. A short device checklist goes in the last ticket.
- Prior art: the engine tests, and the `finishCheck`, `bannerText` and `lastColumn` tests in the workout module.

## Out of Scope

- Records (Phase 2, derived).
- Reopening a past summary from history (Phase 2).
- Notes, "how did it feel", sharing, and charts.
- Rest timer (feature 6), Today (feature 5) and crash resume (feature 7).
- Choosing the Step (weight, reps or both): Pro, Phase 3. The Offer uses the exercise's existing rule.
- kg/lb display (Phase 2).
- Any change to the engine.

## Further Notes

- Glossary: **Offer** is added to `GLOSSARY.md`. "Summary" is a screen name and lives in `docs/screens.md`.
- Docs to update in the same change: `docs/screens.md` (summary contents), `docs/product.md` (summary and Offer behaviour, remove "workout summary" from the not-yet list), and the Phase 1 map when built.
- No ADR: the choices are easy to change later.
