Status: ready-for-agent

# Phase 2 · Feature 3 · Workout settings

Part of Phase 2 (see `.scratch/phase-2/map.md`). Needs: feature 1 (Settings and units). Decisions below come from a grilling session on 2026-11-20.

## Problem Statement

Three behaviors the lifter would reasonably want to control are fixed. Every exercise added to a Routine starts at a 90 s Rest length, so a lifter who rests 2 minutes edits every exercise by hand. The live workout always shows the Last column, even for a lifter who finds it noise. The phone locks after its normal timeout in the middle of a workout, so a lifter resting between sets with the phone on the bench has to unlock it to see the Target or the rest timer.

## Solution

A **Workout** card on the Settings screen, directly under the Units card and above the Data card, with three rows:

- **Default rest**: an inline − / + stepper, in place of the chevron the mockup draws, showing m:ss. It sets the starting Rest length of every exercise added to a Routine afterwards.
- **Show previous set**: a switch. Off hides the Last column in the live workout.
- **Keep screen awake**: a switch. On keeps the screen lit while the live workout is open.

Each change applies at once, with no save button, and survives closing the app. Both switches default to on and Default rest to 90 s, so a fresh install behaves as today plus a lit screen during workouts.

The screen is drawn in the design canvas (`Settings.dc.html`). Two things differ from the mockup: the Default rest row gets a − / + stepper instead of a chevron (update the mockup row), and the separate **Appearance** card at the bottom is left out (light/dark theme is not in this feature, see Out of Scope).

## User Stories

**Default rest**
1. As a lifter, I want a Default rest row in Settings, so that I can set how long I usually rest.
2. As a lifter, I want − and + on that row in 15 s steps from 15 s to 10 min, so that I can reach any rest I use, the same as in Exercise setup.
3. As a lifter, I want the value shown as m:ss (1:30), so that it reads the same as the Rest on the exercise sheet.
4. As a lifter, I want 90 s on a fresh install, so that nothing changes until I touch it.
5. As a lifter, I want an exercise I add to a Routine after changing it to start at my Default rest, so that I stop editing each one.
6. As a lifter, I want exercises already in my Routines to keep their own Rest length, so that changing the default never rewrites what I planned.
7. As a lifter, I want to still change the Rest length of any single exercise in Exercise setup, so that the default is only a starting point.
8. As a lifter, I want the rest timer after a set to keep using that exercise's own Rest length, so that Default rest never shortens or lengthens a rest I already set.

**Show previous set**
9. As a lifter, I want a Show previous set switch, so that I can hide the Last column.
10. As a lifter, I want it on by default, so that the live workout looks as it does today.
11. As a lifter, I want turning it off to hide the whole Last column, its header and every cell, for weighted and bodyweight exercises alike, so that the rows have only Set, weight, reps and the check (Set, reps and the check for a bodyweight exercise).
12. As a lifter, I want the freed width to go to the weight and reps boxes, so that the row does not look gapped.
13. As a lifter, I want the Target banner and the prefilled weight and reps to stay when the column is hidden, so that I still see what I have to hit.
14. As a lifter, I want the Offer, the workout summary and Today to be unchanged by this switch, so that it only affects the column it names.

**Keep screen awake**
15. As a lifter, I want a Keep screen awake switch, so that I can choose whether the phone stays lit.
16. As a lifter, I want it on by default, so that I do not have to find it before my first workout.
17. As a lifter, I want the screen to stay lit while the live workout is open, including while a rest runs, so that I can read the timer and my next Target from the bench.
18. As a lifter, I want the phone's normal auto-lock back as soon as I leave the live workout (finish, discard, back to Today), so that the screen is never held awake elsewhere in the app.
19. As a lifter, I want turning the switch off to restore the normal auto-lock, so that I can save battery.
20. As a lifter, I want the rest timer and its "Rest over" notification to work the same whether the screen is held awake or not, so that the setting changes only the screen.

**All three**
21. As a lifter, I want a change in Settings to apply at once, so that I need no save button.
22. As a lifter, I want my choices to survive closing the app, so that I set them once.
23. As a lifter, I want a fresh install or a restored older database to get the defaults (90 s, on, on), so that an upgrade never leaves a setting empty.
24. As a lifter, I want nothing about these settings to change any stored weight, set, Target or Streak, so that history stays trustworthy.

## Implementation Decisions

- **Storage:** three plain not-null columns on the existing single-row `user_settings` table, in one Drizzle migration: Default rest in seconds (default 90), Show previous set (boolean, default true) and Keep screen awake (boolean, default true). Unlike the Jump columns they are not nullable, because each has one default in either unit. Existing rows get the defaults. Later features add their columns to the same row.
- **Reading:** one hook per setting, in the style of the unit and Jump hooks, so every screen re-renders when one changes and no screen reads the table directly. Reads clamp Default rest with the existing rest clamp, so a bad stored value is repaired on read.
- **Default rest:** the existing new-exercise default (90 s) becomes the setting's default and is read from the setting. Only the path that adds an exercise to a Routine takes the setting. The 90 s fallback used for a workout whose Routine exercise was deleted is a different thing and stays. Existing Routine exercises and their stored rest are never touched. A Default rest change never writes any Routine exercise.
- **Stepper:** − / + step 15 s and clamp to 15 s to 10 min, reusing the existing rest clamp and the Exercise setup sheet's rest label so both read alike.
- **Show previous set:** the live workout reads the setting and, when off, omits the Last column's header and cells for both weighted and bodyweight rows.
- **Keep screen awake:** the live workout holds the wake lock only while that screen is mounted and the setting is on, and releases it on unmount and when the setting turns off. The `expo-keep-awake` package is already installed. Check the Expo SDK 58 docs for its current API before using it.
- **Settings screen:** a Workout card with the three rows, placed between the Units card and the Data card. The switch and stepper controls follow the design system's tokens. No "Pro" badge, no live-workout shortcut (unlike the Units pill, none of these needs a mid-set switch).
- **Docs in the same change:** the Settings mockup's Default rest row is redrawn with the stepper (a design-canvas edit); update `docs/screens.md` (Settings row and the live workout's Last column note), `docs/product.md` (the Settings list, the "screen stay-awake" not-yet line and the new-exercise rest) and `docs/architecture.md` (the `user_settings` columns). `GLOSSARY.md` already gains **Default rest**.
- **No ADR.** Nothing here is hard to reverse or surprising, and the settings are easy to change later.

## Testing Decisions

A good test checks external behavior through the module's interface: what a setting reads back as, and what the lifter would see, not how it is stored or wired.

- **Pure seams, tested with Jest** (one place each, extending the nearest existing test):
  - Settings read and write for all three: a fresh database reads 90 / true / true, a write reads back, and a write touches no other column (the unit and the Jumps are unchanged).
  - Default rest: the stepper's step and clamp at both ends (15 s, 10 min) and a stored out-of-range value repaired on read.
  - New exercise setup takes the Default rest while sets and rep range keep their defaults, and an existing Routine exercise's rest is unchanged after the setting changes (a database test: change the setting, re-read the stored rest of an existing exercise).
  - Last column visibility: with the setting off the column is absent for a weighted and a bodyweight exercise, and present when on.
- **Wake lock:** a pure decision (hold it when the live workout is open and the setting is on) tested as a function. The call into `expo-keep-awake` is not unit-tested.
- **Owner check on a phone** (last ticket): in a workout, switch Show previous set off and on in Settings and see the column come and go; leave the phone untouched for longer than its auto-lock timeout during a workout and confirm the screen stays lit, then finish the workout and confirm the screen locks normally again; add an exercise to a Routine after changing Default rest and confirm only that exercise starts at the new rest.
- Not unit-tested: the Settings screen layout and the switches (device check).
- Prior art: `src/settings/unitSetting.test.ts` and `unitStore.test.ts`, `src/settings/jumpSetting.test.ts`, `src/workout/lastColumn.test.ts`, `src/routines/routineSetup` tests, and the database tests beside them.

## Out of Scope

- **Light/dark theme.** There is no dark token set in the app yet (the canvas's `tokens.json` is a different palette), so it needs its own feature or Phase 4 polish. The Appearance card in the mockup is not built.
- Changing the Rest length of existing Routine exercises, or any "apply to all" action.
- A live-workout shortcut for these settings.
- Holding the screen awake outside the live workout (Offer, summary, Today, Routines).
- Reminders (feature 7) and the backup of these columns (Phase 3).
- A rest-timer sound or vibration setting.

## Further Notes

- The mockup's "2:30" on the Default rest row is sample text, not the default. The default is 90 s (1:30).
- Show previous set only changes what is drawn. The Target and the engine never use the Last column, so no Target, Streak or Offer changes.
- Glossary: **Default rest** added.
