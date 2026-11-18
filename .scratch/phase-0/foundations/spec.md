Status: ready-for-agent

# Phase 0 · Foundations

Gate (from the roadmap): the app opens on both phones; the engine passes every rule.

Progress when this spec was written: units and the overload engine are built and tested. The schema and the first migration are written and waiting for the owner's review. The library seed, theme, base components and tabs are not started.

## Problem Statement

Increment is a gym-logging app whose point is to tell the lifter what to do next: when they have earned more weight or reps, and what the new Target is. Nothing exists yet but a scaffold. Before any screen can be built, the app needs a place to store workouts offline, a trustworthy engine that works out the next Target, correct kg/lb handling, a library of exercises, and a visual foundation. A mistake in the engine or in unit handling would quietly give lifters wrong targets or change their stored data, so these have to be right before anything is built on them.

## Solution

Build the foundations in the order of risk. First the pure logic: unit conversion and the overload engine, covered by tests for every rule. Then a local database with one first migration, seeded on first launch with a curated exercise library. Then a theme and a small set of base components built on Expo UI, shown in a dev-only gallery and four placeholder tabs. The lifter-visible result is an app that opens on an iPhone and an Android phone, with the right look and an exercise library already inside it. The developer-visible result is an engine that passes every rule.

## User Stories

1. As a lifter, I want my weights stored exactly once, in kg, so that switching between kg and lb never changes my data.
2. As a lifter who trains in lb, I want a weight I typed as 135 lb to show as 135 lb again, so that my numbers look the way I entered them.
3. As a lifter, I want to switch between kg and lb as often as I like, so that I can train at gyms that use different units.
4. As a lifter, I want weights shown to at most two decimals with no trailing zeros, so that "62.5" is not shown as "62.50".
5. As a lifter, I want the app to count a workout as "on Target" only when every planned set reached the Target weight and reps, so that progress is honest.
6. As a lifter, I want warm-up sets and sets I did not mark done ignored for progression, so that they do not distort my Target.
7. As a lifter, I want only my first planned sets judged, so that an extra set I did for fun cannot hide a failed set or cause a miss.
8. As a lifter, I want a workout where I lifted heavier than the Target to count as on Target, so that I am not punished for doing more.
9. As a lifter, I want a workout where I lifted lighter than the Target to count as short of Target but not a failure when my reps stayed in range, so that a deliberate lighter day is not treated as a miss.
10. As a lifter, I want my first workout of an exercise to set my starting point from what I actually lifted, so that the app never invents a weight for me.
11. As a lifter, I want that first workout not to count toward my Streak, so that progress starts from a judged workout.
12. As a lifter, I want progression to be Earned only after I hit my Target for a number of workouts in a row, so that I increase when I am ready and not after one good day.
13. As a lifter, I want the number of workouts in a row to default to 3, so that the default is steady and safe.
14. As a Pro lifter, I want to set that number between 1 and 5 per exercise, so that I can progress faster or slower to suit me.
15. As a lifter, I want the app to ask me whether to progress once I have Earned it, so that the decision stays mine.
16. As a lifter, I want a step I accept to appear as the Target in my following workout, so that it is easy to see what to hit next.
17. As a lifter, I want a step I decline to leave my Target unchanged, and to be asked again after my next on-Target workout, so that I am not nagged but not forgotten either.
18. As a lifter, I want a workout that is short of Target but inside my rep range to keep my Target and restart my Streak, so that I try again without being punished.
19. As a lifter, I want a workout with a set below the bottom of my rep range, or fewer sets than planned, to count as a miss, so that real failures are recognised.
20. As a Pro lifter, I want to choose what happens after a number of misses in a row at the same weight (keep the weight, or drop by a percentage), so that I handle bad weeks my way.
21. As a lifter, I want a lighter workout in between misses neither to count as a miss nor to reset the count, so that one light day cannot hide a pattern.
22. As a lifter, I want an on-Target workout to reset my miss count, so that recovery is recognised.
23. As a lifter, I want a drop after misses to always land strictly lower and never below zero, so that the drop is real and sensible.
24. As a Pro lifter, I want to turn on a deload every N weeks and set how much lighter it is, so that I can plan recovery.
25. As a lifter, I want a deload to be off unless I turn it on, so that nothing changes without my choice.
26. As a lifter, I want a deload to count weeks I actually trained and not workouts, so that training three times in one week does not trigger it early.
27. As a lifter, I want the workout after a deload to return to my working Target, so that a deload never costs me progress.
28. As a lifter, I want a deload workout never to count as a miss or as part of my Streak, so that a planned light day is neutral.
29. As a lifter, I want a pending offer to survive a deload, so that I do not lose progress I already earned.
30. As a lifter, I want my step to be adding weight, adding reps, or adding both, set per exercise, so that a gym lift and a home exercise can progress differently.
31. As a lifter, I want the reps added per step to be 1, 2 or 3, so that I control how fast reps rise.
32. As a lifter, I want reps never to be offered beyond the top of my rep range, so that targets stay inside the plan.
33. As a lifter, I want to be told when I have reached the top of my rep range and there is nothing more to add by reps, so that I know to change my plan.
34. As a lifter doing bodyweight exercises such as push-ups, I want progression to add reps only, so that I am never asked to add weight I cannot add.
35. As a lifter doing exercises like pull-ups or dips, I want to start by adding reps but be able to add weight later, so that the app grows with me.
36. As a free user, I want a sensible rule chosen for me from the exercise's load type, so that progression works without any setup.
37. As a lifter, I want a weight step to always move to the next multiple of my Jump above my current weight, so that a step up is never rounded back to where I started.
38. As a lifter, I want my Jump to work correctly when it comes from pounds (such as 5 lb), so that rounding is never off by one step.
39. As a lifter, I want a drop or deload to round down to a multiple of my Jump, so that weights are always ones I can load.
40. As a lifter, I want the Target I was shown at the start of each workout to be remembered, so that my workout is judged against what I was actually shown, even if I change my rule later.
41. As a lifter, I want my accepted steps remembered, so that my next Target survives closing the app.
42. As a lifter, I want my data stored on my phone with no account, so that the app works offline and my data stays mine.
43. As a lifter, I want a library of common exercises ready on first launch, so that I can build a routine straight away.
44. As a lifter, I want each library exercise to say whether it is a weighted, bodyweight, or bodyweight-or-weighted exercise, so that progression suits it.
45. As a lifter, I want the library to come from a source whose license allows commercial use, so that the app is safe to publish.
46. As a lifter, I want the app to open quickly and show its own font and colours rather than a blank or default screen, so that it feels finished from the first launch.
47. As a lifter, I want four tabs (Today, Routines, Library, Progress) in a floating tab bar, so that the shape of the app is clear from day one.
48. As a lifter, I want buttons, cards, pills, inputs and sheets to look and behave consistently, so that every screen feels like one app.
49. As a lifter on iPhone or on Android, I want native controls that feel at home on my phone, so that the app does not feel foreign.
50. As a lifter, I want touch targets of at least 44 pt, so that I can tap accurately in the gym.
51. As the developer, I want a hidden component gallery, so that I can look at every base component on both phones.
52. As the developer, I want every engine rule covered by a test with an example, so that a rule change that breaks behaviour fails loudly.
53. As the developer, I want the engine to depend on nothing but plain inputs, so that it can be tested without a database or a screen.
54. As the developer, I want the rule's stored format to carry a version number, so that backups of today's rules still import after the format changes.
55. As the developer, I want one migration that creates every table, so that the first release has a single clean starting point.
56. As the developer, I want the library seed checked by a test, so that a bad entry is caught before it ships.
57. As the owner, I want the free vs Pro split to stay out of the engine, so that limits are checked in one place later.
58. As the owner, I want the docs and glossary kept in step with the decisions, so that the next person does not have to guess.

## Implementation Decisions

**Units**
- Weights are stored in kg as full-precision numbers, alongside the unit the lifter entered. Conversion uses the exact pound definition (0.45359237 kg). Display converts, rounds to two decimals and drops trailing zeros. A converted value is never written back.
- This storage decision gets an ADR: it is hard to reverse, surprising, and had real alternatives (store the entered unit's value, or round the stored kg).

**Overload engine** (pure; weights in kg; no I/O)
- One entry point takes the rule, the planned sets and rep range, the exercise's load type, the exercise's history (newest first) and the Jump, and returns a Target, an optional proposal, and a reason code. A separate classifier judges one past workout.
- The Target is a weight and a reps number. The proposal is the stepped-up Target to offer once progression is Earned. The reason is a code, not text, so screens can word it.
- A rule carries a version number, a step (weight, reps or both), a rep step (1–3), the workouts-in-a-row needed to earn (default 3, 1–5), an optional miss rule (after N misses, keep the weight or drop by a percentage) and an optional deload (every N weeks, by a percentage; absent means off).
- History entries carry the date, the Target that was shown (absent for a first workout), whether the lifter accepted the offered step, whether it was a deload, and the logged sets in order.
- Outcomes of a past workout: **clean**, **hold**, **miss**, plus **baseline** (no Target was shown) and **deload** (skipped). Only the first planned working sets are judged. A set counts as meeting the Target when its weight is at least the Target weight and its reps are at least the Target reps.
- **Earned**: the Streak (clean workouts in a row at the same Target) reaches the rule's number. Deload and baseline workouts neither add to nor reset it, except that a baseline workout ends the count. A changed Target restarts it.
- **Accepting** a step is recorded on the workout it followed, and the engine then returns the stepped Target for the next workout. Declining changes nothing, and the offer returns after the next clean workout.
- **Steps**: weight moves to the next multiple of the Jump strictly above the current weight; reps add the rep step capped at the top of the range, with no offer once at the top; both does both. Bodyweight exercises can only step by reps whatever the rule says.
- **Misses**: counted in a row at the same weight; holds are neutral; a clean workout resets the count. After the configured number, keep leaves the Target unchanged and drop lowers it by the percentage, rounded down to a multiple of the Jump, always strictly lower, never below zero.
- **Deload**: due after N distinct Monday-based calendar weeks containing a workout since the last deload; the next Target is the working Target lightened by the percentage, rounded down to a multiple of the Jump. The workout after returns to the working Target. Weeks are computed from calendar dates by integer arithmetic, so time zones cannot move a workout into another week.
- **Rounding** is only ever to multiples of the Jump, with a small tolerance so that Jumps derived from pounds never land one multiple off. Plates and bar weight are not part of the engine.
- **Free rule**: a default rule built from the exercise's load type: weight for weighted exercises, reps for the other two, rep step 1, three workouts in a row, no miss rule, no deload. Free vs Pro gating is not in the engine.

**Database** (Drizzle on expo-sqlite; one migration; run on app start; library seeded on first launch)
- Tables: exercises, routines, routine exercises, workouts, workout exercises, sets, settings, entitlements.
- Exercises gain a load type (weighted, bodyweight, bodyweight or weighted) and a stable slug so re-seeding never duplicates rows.
- Workout exercises is new: it stores the Target shown at the start, whether the lifter accepted the offered step, and whether it was a deload. Sets hang off it. Records stay derived from sets; Targets and acceptances are stored because they are what the lifter was shown and decided, not derived records.
- Workouts carry a local calendar date. Deleting a routine keeps its workouts.
- Plates are not stored anywhere in Phase 0.
- The schema is reviewed by the owner before anything builds on it. After that the migration is frozen.

**Library**
- Seeded from a curated subset (roughly 150–250 common lifts) of the public-domain free-exercise-db dataset, text instructions only, each with a load type. The license is verified in the dataset's own repository before importing, and the owner reviews the curated list.

**UI foundation** (on Expo UI)
- A typed token module for the light theme and Sora, with room for a dark set later. Fonts load at runtime and the splash screen stays up until fonts and migrations are ready.
- Base components: text, button (primary and secondary pills), card, pill (including the accent-tint variant), input, bottom sheet, and the floating tab bar with four placeholder tabs.
- Universal Expo UI components are used first; React Native views fill the gaps (card, pill, tab bar). A spike (one accent pill button and one Sora text on both phones) comes before the rest, and any component that cannot match the design gets wrapped and reported to the owner.
- A dev-only gallery route shows every base component.

**Structure and process**
- Folders: theme, components, db, engine, units, stores. Tests sit next to the code. Work is on a feature branch from main; no commits unless asked.

## Testing Decisions

- A good test checks external behaviour only: given a rule, planned sets, load type, history and Jump, assert the Target, proposal and reason; given a weight and unit, assert what is shown. Tests never reach into helpers or internal ordering.
- **Seam 1: engine and units.** One seam, plain inputs and outputs. Every rule above has at least one example test, including the edge cases: lighter or heavier than the Target, extra sets, first workout, miss/hold interplay, deload skipping, a pending offer surviving a deload, Jumps derived from pounds, and kg ↔ lb round trips over many switches that never alter the stored value.
- **Seam 2: library seed data.** A test over the curated exercise file: unique slugs and names, a valid load type, equipment and non-empty instructions on every row, and no unsupported fields.
- **Seam 3: the gate on devices.** No automated test. The owner opens the app in Expo Go on an iPhone and an Android phone, and the build is also checked with an iOS and Android export, the type checker, lint and the Expo doctor. The migration runner and seeding are proven by that on-device check, because Jest cannot run the native SQLite module.
- Prior art: the existing engine and unit test suites already cover seam 1.

## Out of Scope

- Any real screen: Today, routines, library browsing, the live workout, rest timer, summary, and the screen where an exercise's step is chosen (Phase 1).
- Records, exercise history, kg/lb settings, Jump settings and the plates inventory (Phase 2).
- Purchase, paywall, limit pop-up, custom exercises, charts, backups, export, plate calculator, and every Pro check (Phase 3).
- Onboarding and the plan generator, accessibility work, haptics, icon and store art (Phase 4).
- Dark theme values, until the owner supplies the dark tokens.
- A development build; Expo Go is enough until a native module requires one.
- Deciding the Pro price, the free routine limit and trademark checks; these remain open in the decisions doc.

## Further Notes

- The engine does not take today's date. Deload counts weeks that contain a workout, so it can be worked out from history alone.
- Docs to update in the same change: the data rules (jump-only rounding; stored Targets allowed), architecture (workout exercises, load type, the deload flag's new home, plates out of settings), product (the free rule comes from the load type), the roadmap wording for plates, the decisions doc (library source), the glossary (streak, step, rep step, clean, hold, miss, deload, load type, workout exercise) and the ADR above.
- Open risk: Expo UI's universal components may not style to the design system (custom font, pill shape). The spike answers this early.
- Open item for the owner: confirm the schema, then review the curated library list.
