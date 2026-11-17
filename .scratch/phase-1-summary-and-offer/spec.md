Status: ready-for-agent

# Phase 1 · Feature 4 · Summary and Offer

Part of Phase 1 (see `.scratch/phase-1-core-training-loop/map.md`). Needs: Live workout core (feature 3). Decisions below come from a grilling session on 2026-11-17, and two design changes the same day: the Offer moved from the summary to its own screens, and then to one Offer per screen.

## Problem Statement

The lifter finishes a workout and lands back where they started, with no sign of how it went. They cannot see their volume, whether each exercise was Clean, Held or Missed, or what weight and reps they will be asked to hit next time. When progression is Earned, the app has a stepped-up Target ready, but nowhere to ask whether the lifter wants it.

## Solution

Finish saves the workout. For each exercise where progression is Earned, an **Offer screen** opens, one exercise per screen, with only two buttons: Go up and Stay. Each tap saves the answer and opens the next Offer. Ten Earned exercises are ten screens, shown one at a time so the lifter notices each one. After the last answer, a **summary screen** opens, showing the workout's duration, sets and volume, and one card per exercise with how it went and the next Target. The summary only reports. Done returns to where the workout started. When nothing is Earned, Finish goes straight to the summary.

## User Stories

**Flow**
1. As a lifter, I want Finish to save my workout and unlock its routine before anything else shows, so that nothing is lost if I leave or the app is killed.
2. As a lifter, I want an Offer screen right after Finish for each exercise I earned a heavier weight on, so that the question is hard to miss.
3. As a lifter, I want no Offer screen when nothing was earned, so that Finish goes straight to my summary.
4. As a lifter, I want the summary to open after my last Offer, so that I always see how the workout went.
5. As a lifter, I want back, swipe and Done on the summary to return to where the workout started, so that every way out behaves the same.
6. As a lifter, I want a killed app to reopen on the normal tab, so that I am not stuck in a half-finished flow.
7. As a lifter, I want the Finish prompt to work as before (unchecked sets, skipped exercises, no sets done), so that the new screens do not change how I finish.

**Offer**
8. As a lifter, I want each Offer on its own screen, so that I notice every one and answer each on purpose.
9. As a lifter, I want the Offer to show the exercise, its Clean streak, and the change from my current Target to the stepped-up Target (for example 60 kg × 10 to 62.5 kg × 10), so that I know exactly what I am choosing.
10. As a lifter, I want only two buttons, "Go up to 62.5 kg" and "Stay at 60 kg", so that I know what each tap does and have nothing else to tap.
11. As a lifter, I want a progress bar and a count ("2 of 5") on every Offer, so that I know how many are left.
12. As a lifter, I want my tap to save my answer at once and open the next Offer, so that I move through quickly and nothing is lost if the app is killed.
13. As a lifter, I want my answer to be final once I tap, so that the Target I chose stays the Target I get.
14. As a lifter, I want back and swipe to do nothing on an Offer screen, so that I cannot skip an Offer by accident. The two buttons are always there, so I am never trapped.
15. As a lifter, I want Offers I have not answered, because the app was killed, to count as Stay, so that nothing goes up unless I chose it.
16. As a lifter who stayed, I want the Offer to come back after my next Clean workout, so that I am not asked again straight away.
17. As a lifter, I want my choice to set my next Target, so that the next workout shows the weight I chose.
18. As a lifter, I want no Offer on a Deload workout, so that a light day does not ask me to go up.

**Summary**
19. As a lifter, I want the summary to show how long the workout took, so that I know my session length.
20. As a lifter, I want the summary to show how many sets I did, so that I can see the work I put in.
21. As a lifter, I want the summary to show total volume in kg (done working sets, weight × reps), so that I can see how much I lifted.
22. As a lifter who did only bodyweight exercises, I want total reps in place of volume, so that the header never reads "0 kg".
23. As a lifter, I want bodyweight sets to add 0 to volume and weighted bodyweight sets to count their added load, so that volume matches what I lifted.
24. As a lifter, I want one card per exercise I did, so that I can read each result separately.
25. As a lifter, I want exercises I skipped left off the summary, so that skipping does not look like a failure.
26. As a lifter, I want each card to say whether the exercise was Clean, Held or Missed, so that I understand the result.
27. As a lifter, I want a Clean card to show my Streak progress (for example "2 more at 60 kg × 10 to earn 62.5 kg"), so that I know how close the next step is.
28. As a lifter, I want a Hold card to say my Streak restarts and the Target stays, so that I know what a Hold means.
29. As a lifter, I want a Miss card to show the next Target, including any drop the exercise's miss rule applies, so that I am not surprised next time.
30. As a lifter whose workout was the first one for an exercise, I want the card to say a baseline was set and show the next Target from what I logged, so that I get a Target for next time.
31. As a lifter at the top of my rep range with no step to offer, I want the card to say so, so that I know why nothing went up.
32. As a lifter on a Deload workout, I want the card to say it does not count toward my Streak, so that a light day does not worry me.
33. As a lifter, I want every card to show the next Target as weight × reps, so that I know what to hit next time.
34. As a lifter who stayed on an Earned exercise, I want its card to say "Staying at 60 kg. The offer comes back after your next clean workout.", so that I know it is not lost.
35. As a lifter who went up, I want its card to show the stepped-up Target as the next Target, so that the summary agrees with my choice.
36. As a lifter, I want the summary to show no records, so that it only says what this workout did. Records arrive in Phase 2.
37. As a lifter, I want the summary to have no Accept, Decline, Go up or Stay, so that I am never asked the same question twice.
38. As the developer, I want an exercise's next Target to come from the existing engine, so that the rules live in one place.

## Implementation Decisions

**Flow**
- Finish saves as it does today (`finished_at` set, `in_progress` false, routine unlocked). The live screen is then replaced by the first Offer screen when at least one exercise has an Offer, otherwise by the summary.
- Each Offer screen replaces the one before it. After the last answer the summary replaces the last Offer. Done (and back, swipe, Android back) on the summary returns to where the workout started.
- Back, swipe and the Android back button are disabled on Offer screens. Go up and Stay are the only way forward, and Stay is always available.
- Offer screens and the summary are shown once and cannot be reopened. If the app is killed mid-flow, the lifter reopens to the normal tab; answers already tapped are saved and the rest are Stay. A reopenable summary belongs to crash resume (feature 7) and exercise history (Phase 2).
- The Finish prompts, Discard and the one-workout-at-a-time rule are unchanged.

**Offer screen**
- A progress bar with one segment per Offer, the eyebrow "You earned a heavier weight", a count ("2 of 5"), the exercise name, its Clean streak pill, a panel with "Next time" showing the current Target, an arrow, and the stepped-up Target in large type, and a note "Stay keeps 60 kg. The offer comes back after your next clean workout."
- Two buttons only: "Go up to 62.5 kg" (primary) and "Stay at 60 kg" (outlined). There is no Continue, no skip and no "go up on all".
- Tapping Go up writes `progress_accepted = true` on that Workout exercise; tapping Stay writes `false`. Either opens the next Offer, or the summary after the last. Answers are final.
- Offers run in workout order. An Offer is shown only when the engine returns a proposal. There is no Offer on a Deload workout.

**Summary screen**
- Header: duration (finished minus started, in whole minutes), sets (done working sets across the workout), and volume (sum of weight × reps over done working sets, in kg). Volume at 0 is replaced by total reps. The header never reads 0 kg. Weights stay kg until the Phase 2 unit switch.
- One card per exercise with at least one done set, in workout order. Skipped exercises are left out.
- Each card shows the outcome, one short line chosen from the engine's reason, and the next Target (weight × reps). The Streak count appears only on Clean cards. An Earned exercise the lifter stayed on says the offer comes back after the next Clean workout.
- No buttons other than Done, no records, no feel, no Share.
- Wording is derived from the engine's reason codes and outcome. The engine itself is not changed.

**Data**
- No schema change. `progress_accepted` already exists on workout exercises and is false from Start; the Offer screens are the first to set it.
- The next Target is the engine's result over the exercise's history by routine (ADR 0002), with this workout and its `progress_accepted` included.

**Pure functions** (no I/O, tested): the summary builder and the card-line wording. The builder's output also lists the Offers in order (Workout exercise id, exercise name, streak, current Target, stepped-up Target), which the Offer screens read. The builder exposes the current Target next to the stepped-up one, so a screen can show both.

**Screens** (design canvas, Train row, in flow order): Today, Live workout, Start while one is in progress, Finish workout, Discard workout, Offer 1 of 3, Offer 2 of 3, Workout summary, then the Today states. The old summary frame's records, "How did it feel?" and Share are removed.

## Testing Decisions

- A good test checks external behaviour: given a finished workout and history, what the summary and Offers say. It does not check how the builder is structured.
- One seam: the summary builder, a pure function over plain inputs (the done sets, the Target shown, the plan, the rule, the load type, the exercise's history including this workout, the Jump, and the start and finish times). It returns the header, the cards, and the ordered Offers.
- Example tests: Clean 1 of 3; Earned with an Offer; two Earned exercises give two Offers in workout order, and none are listed when nothing is Earned; accepted shows the stepped Target; declined or unanswered keeps the Target and says the offer returns; Hold; Miss, with and without a miss-rule drop; first-workout baseline; top of range with no Offer; Deload; a skipped exercise left out; volume with bodyweight and weighted-bodyweight sets; an all-bodyweight workout showing total reps.
- Not unit-tested: the database write for each answer, navigation after Finish, the disabled back action, and the screens. A short device checklist goes in the last ticket.
- Prior art: the engine tests, and the `finishCheck`, `bannerText` and `lastColumn` tests in the workout module.

## Out of Scope

- Records (Phase 2, derived).
- Reopening a past Offer or summary from history (Phase 2).
- Notes, "how did it feel", sharing, and charts.
- Rest timer (feature 6), Today (feature 5) and crash resume (feature 7).
- Choosing the Step (weight, reps or both): Pro, Phase 3. The Offer uses the exercise's existing rule.
- kg/lb display (Phase 2).
- Any change to the engine.
- Changing an answer after tapping it, "go up on all", and a compact Offer card. All were sketched and set aside.

## Further Notes

- Glossary: **Offer** is in `GLOSSARY.md`. "Offer screen" and "summary" are screen names and live in `docs/screens.md`.
- Decided by default, change if wrong: answers are final once tapped, and back and swipe are disabled on Offer screens (so an Offer cannot be skipped).
- The first build of this feature put the Offer inline on the summary (tickets 02 and 03). Ticket 05 replaces that with one Offer per screen.
- No ADR: the choices are easy to change later.
