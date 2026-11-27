# Onboarding shell and Quick start: spec

**Status:** ready-for-agent

Phase 4 feature 1 (see `.scratch/phase-4/map.md`). Built on its own branch from `main`. It is the first Phase 4 feature and ends with something usable on a phone: a fresh install shows Welcome once, and Quick start gets the lifter to Today with a plan.

> **Temporary by design.** Feature 1 ships before the Questions (feature 2), the plan generator (feature 3) and Welcome back (feature 4), so three things in it are stand-ins that later features replace:
> 1. **The Starter plan is hard-coded** (one fixed Full body A/B plan), not generated. Feature 3 replaces it with the generator and must produce the same plan for the Quick start defaults.
> 2. **"Get started" goes to Quick start**, because the questions don't exist yet. Feature 2 points it at Goal.
> 3. **"I already have Increment" opens the existing Restore from a backup flow**, then Today, because Welcome back doesn't exist yet. Feature 4 points it at Welcome back.

## Problem Statement

A lifter who installs Increment lands on an empty Today ("No routine yet") with no explanation of what the app does, no routines and no unit chosen. There is no first-run screen at all, and no way for a returning lifter to say "I already have Increment". The Phase 4 gate (install to first logged set in under 3 minutes) cannot be met.

## Solution

A fresh install shows Welcome once. Welcome offers "Get started" and "I already have Increment". Get started opens Quick start: simple default answers (Stay fit and healthy, Just starting, 3 days Mon, Wed, Fri, Full gym), a kg / lb choice, and a ready plan of two Full body routines. Start training creates the routines, saves the unit, marks onboarding done and opens Today. An existing install never sees any of this: updating the app marks it as onboarded.

## User Stories

1. As a new lifter, I want a Welcome screen on first launch, so that I know what Increment does before I use it.
2. As a new lifter, I want Welcome to say "Lift a little more every week" with one line of what the app does, so that the idea is clear in a few seconds.
3. As a new lifter, I want a big "Get started" button, so that the first step is obvious.
4. As a returning lifter, I want an "I already have Increment" button on Welcome, so that I am not forced through setup.
5. As a returning lifter, I want "I already have Increment" to open the restore from a backup flow, so that I can bring my data back.
6. As a returning lifter who restored a backup, I want to land on Today afterwards, so that I can train at once.
7. As a returning lifter who backs out of the restore, I want to return to Welcome with nothing changed, so that I can still choose Get started.
8. As a new lifter, I want Get started to open Quick start, so that I reach a plan in one tap.
9. As a new lifter on Quick start, I want to see my defaults (Goal, Experience, Schedule, Equipment) listed, so that I know what the plan is based on.
10. As a new lifter, I want each default marked "Default", so that I know I did not choose it.
11. As a new lifter, I want a kg or lb choice on Quick start, so that weights are in the unit my gym uses.
12. As a new lifter, I want kg preselected, so that I can go on without choosing.
13. As a new lifter, I want to see the two routines I will get (Full body A on Mon and Fri, Full body B on Wed) with a short exercise line each, so that I know what Start training creates.
14. As a new lifter, I want "Start training" to create my routines, so that Today shows my first workout.
15. As a new lifter who picked pounds, I want my routines' weights and the app to use pounds from the first workout, so that nothing shows in the wrong unit.
16. As a new lifter, I want Today to open after Start training, so that I can start my first workout immediately.
17. As a new lifter, I want the plan's Full body A on Monday and Friday and B on Wednesday to show on Today's week strip, so that I see my week.
18. As a new lifter, I want the plan's exercises, sets, rep range and rest filled in (3 sets of 10 to 15 reps, 1:00 rest), so that I can start without setting anything up.
19. As a new lifter, I want my plan to fit the free routine limit, so that nothing is locked on day one.
20. As a new lifter, I want nothing saved until I tap Start training, so that leaving the screen creates no routines and no unit.
21. As a new lifter who kills the app on Quick start, I want to start again at Welcome, so that I never land in a half-set-up app.
22. As a new lifter who kills the app after Start training, I want to land on Today, so that onboarding does not show twice.
23. As a lifter who finished onboarding, I want Welcome never to show again, so that the app opens straight to Today.
24. As an existing lifter updating the app, I want no Welcome screen, so that my routines and history are untouched.
25. As an existing lifter updating the app, I want my unit and settings unchanged, so that nothing about my data moves.
26. As a lifter who has routines or workouts but no settings row (an old build), I want to count as onboarded, so that I am not shown Welcome over my own data.
27. As a lifter who restored a backup from Welcome, I want onboarding marked done, so that Welcome does not come back on the next launch.
28. As a lifter who restores a backup later from Your data, I want it never to re-open onboarding, so that restoring is safe.
29. As a lifter who uses Delete all data, I want it never to re-open onboarding, so that I stay on Your data as designed.
30. As a lifter with a fresh install and a Workout in progress after Start training, I want the Welcome gate never to appear over my workout, so that no work is lost.
31. As a new lifter, I want Welcome and Quick start to look right in light and dark, so that the first screen matches my phone.
32. As a new lifter, I want the tab bar and in-progress bar hidden during onboarding, so that I cannot wander into an empty app.
33. As a new lifter, I want the Android back button on Welcome to leave the app rather than open an empty Today, so that onboarding cannot be skipped by accident.
34. As a new lifter, I want to reach my first logged set in under 3 minutes, so that the Phase 4 gate can be met.
35. As the owner, I want the plan, unit and done flag written together or not at all, so that a crash cannot leave routines without `onboarded` or the reverse.
36. As the owner, I want the hard-coded Starter plan in one place, so that feature 3 replaces it in one move.
37. As the owner, I want the "onboarded" decision for existing installs made by the migration, so that no runtime guess is needed.
38. As the owner, I want a test that an old database reads as onboarded, so that no update ever shows Welcome to a lifter with data.

## Implementation Decisions

- **One new module, "onboarding".** It is the only place that knows whether onboarding is done and how it finishes. Interface:
  - `isOnboarded(db)`: reads the `onboarded` flag.
  - `finishQuickStart(db, unit)`: in one all-or-nothing transaction, creates the Starter plan, saves the unit and sets `onboarded`.
  - `finishOnboarding(db)`: sets `onboarded` only (used by the restore path now, and by Welcome back's Done in feature 4).
  - A small pure routing function: onboarded or not, to "welcome" or "tabs".
- **Schema:** one new `onboarded` boolean column on `user_settings`, default false (a Drizzle migration; never edit a shipped one). The migration sets it to true for every existing install, meaning an install that has a settings row, any routine or any workout. A fresh install has none of these when the migration runs, so it starts false. The settings row is created on first read as today.
- **Nothing is written before the finish call.** Welcome and Quick start hold their choices (the kg or lb pick) in screen state only. Killing the app mid-way restarts at Welcome. The unit is saved only inside `finishQuickStart`.
- **Starter plan (hard-coded, feature 1 only).** The defaults are the Quick start defaults from the Glossary: Stay fit and healthy, Just starting, 3 days Mon, Wed, Fri, Full gym. The plan is the Full body A/B split from the map:
  - Full body A on Monday and Friday (the first and third day), Full body B on Wednesday.
  - 4 library exercises per routine (Just starting = 4 exercises; see Further Notes), chosen from the Full gym list and named in the plan constant.
  - 3 sets, Rep range 10 to 15, rest 1:00 (Stay fit and healthy).
  - The Overload rule and Jump stay at the app defaults.
  - It uses the existing routine and exercise creation functions, not raw SQL, and fits the 3-routine free limit.
  - Marked in the code and docs as replaced by the generator in feature 3, which must return this same plan for these defaults (a test in feature 3 pins that).
- **Routing:** the root layout reads `isOnboarded` once the database is ready, with the other startup reads, and shows Welcome (a stack screen outside the tabs, with no way back into the tabs) until onboarding finishes. After it finishes, the lifter lands on Today and the gate never shows again. The tab bar and the in-progress bar are not on Welcome or Quick start.
- **Welcome (`OnbWelcome` on the canvas):** hero illustration, "Lift a little more every week", one-line body, **Get started** and **I already have Increment**. Get started opens Quick start (temporary, feature 2 points it at Goal).
- **Quick start (`OnbQuick`):** "You're all set", the four default rows with a "Default" tag, a Kilograms / Pounds segmented choice ("Which weights does your gym use?", kilograms preselected), the two plan rows, **Start training** and the link "Answer the questions instead". The default rows and "Answer the questions instead" do nothing in feature 1 (the questions arrive in feature 2): the rows are drawn without chevrons that lead nowhere, and the link is hidden. Feature 2 turns them on. Start training calls `finishQuickStart` and opens Today. (Reminders step is feature 4, so no Reminders screen here.)
- **"I already have Increment" (temporary):** opens the existing Restore from a backup flow. A successful restore calls `finishOnboarding` and opens Today. Backing out returns to Welcome with nothing saved. Restoring never resets `onboarded`.
- **Restore from a backup and Delete all data never reset `onboarded`.** Delete all data already resets preferences to defaults, so it must be told to keep this flag.
- **Backup file:** `onboarded` is device state, not lifter data. It is not added to the backup file and needs no format bump. A restored backup does not change it.
- **Docs in the same change:** Glossary (Onboarding, Quick start already exist; note the temporary routes only in the spec), `docs/screens.md` rows for Welcome and Quick start, `docs/architecture.md` (the `onboarded` column and the routing gate), `docs/product.md` Onboarding section if wording changes, `docs/decisions.md` (the `onboarded` rules and the hard-coded Starter plan). No ADR: reversible and nothing surprising.
- **Design canvas** (`OnbWelcome`, `OnbQuick`) is the source for layout. The owner updates the canvas for the map's notes (the Schedule hint, Reminders, Quick start matching the map). This work does not edit the canvas.

## Testing Decisions

- A good test checks behavior through the onboarding module against `createTestDb()` (an in-memory database with every real migration), never a screen, and never mocks the database. This matches the existing query tests (`unitSetting.test.ts`, `deleteAllData.test.ts`, `restoreBackup.test.ts`).
- **The one seam** is the onboarding module (`isOnboarded`, `finishQuickStart`, `finishOnboarding` and the pure routing function).
- Cases to cover:
  - a fresh database reads not onboarded and has no routines;
  - a database migrated from the previous migration reads onboarded when it has a settings row, a routine or a workout (a migration test at the previous number, like the 0009 test in `src/db/migrations.test.ts`), and a truly empty old database reads not onboarded;
  - `finishQuickStart("kg")` makes exactly 2 routines, A on Mon and Fri, B on Wed, each with 4 exercises of 3 sets, rep range 10 to 15 and 60 s rest, all library exercises, the unit saved and `onboarded` true; with `"lb"` the unit is lb and nothing else differs;
  - the plan fits the free limit (not locked, `canCreateRoutine` agrees);
  - `finishQuickStart` is all-or-nothing: when creating a routine fails part way, no routine, no unit and no flag are written;
  - `finishOnboarding` writes only the flag (0 routines, unit unchanged);
  - nothing is written before the finish call (state after reading `isOnboarded` repeatedly is unchanged);
  - `restoreBackup` and Delete all data leave `onboarded` true (and a fresh database that is restored, then deleted, stays true);
  - the routing function returns welcome when not onboarded and tabs when onboarded.
- Prior art: `src/settings/unitSetting.test.ts`, `src/backup/deleteAllData.test.ts`, `src/backup/restoreBackup.test.ts`, `src/db/migrations.test.ts`.
- Not tested in Jest: the Welcome and Quick start screens and the real flow. The owner checks them by hand on an iOS and an Android phone (fresh install, update from the previous build, restore from Welcome, kill the app on Quick start, light and dark).

## Out of Scope

- The questions: Goal, Experience, Schedule, Equipment and Units (feature 2). So "Get started" goes to Quick start for now, and the Default rows are not tappable.
- The plan generator, the 28 exercise lists and Your plan with "I'll build my own routines" (feature 3). The Starter plan is hard-coded here.
- The Reminders step and Welcome back, including the Pro row and Restore purchase (feature 4).
- Accessibility pass and haptics (features 5 and 6), though labels and 44 pt targets follow the app's normal rules.
- The splash screen (feature 7).
- Updating the design canvas.
- Showing onboarding again for any reason, and a way to re-open it from Settings.

## Further Notes

- **Exercise count:** the map says Just starting gets 4 exercises per routine, but the `OnbQuick` frame shows "5 exercises". This spec follows the map (4). The owner should fix the frame when updating the canvas for Phase 4.
- **Reading the existing install rule:** the migration treats a settings row, a routine or a workout as "existing install". Every install that has launched since Phase 2 has a settings row (it is created on first read at launch), so the extra checks only cover the oldest builds.
- **Phone check** (owner, before the feature is done): fresh install shows Welcome once; Quick start to Today in a few taps; "I already have Increment" with a backup file; an update over the previous build shows no Welcome; kill the app on Quick start and reopen at Welcome.
- Tickets are not written yet. Next step is `/to-tickets` on this spec.
