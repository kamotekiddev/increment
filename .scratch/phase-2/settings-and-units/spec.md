Status: ready-for-agent

# Phase 2 · Feature 1 · Settings and units

Part of Phase 2 (see `.scratch/phase-2/map.md`). Needs: Phase 1. Decisions below come from a grilling session on 2026-11-18.

## Problem Statement

Every weight in the app is shown in kg, because `"kg"` is written into about ten places (live workout, Offer, Summary, Today preview, banner, rest timer). A lifter who trains in lb cannot read their Targets or type a weight in their own unit. There is also no Settings screen and no place to keep a preference.

## Solution

A Settings screen, opened from a gear on Today, with a **Units** card: a Kilograms / Pounds control and the note "History, records and charts convert for display. What you logged never changes." The live workout gets the same switch as a small `kg | lb` pill in its header, beside "Exercise 1 of 5". One global preference drives every weight shown, typed or prefilled. Stored kg and `entered_unit` never change (ADR 0001). This is the first half of the Phase 2 gate.

Both screens are drawn in the design canvas (`Settings.dc.html`, `Workout.dc.html`). Nothing in the mockup changes for this feature; the rows it shows that belong to later features are left out (see Out of Scope).

## User Stories

**Choosing a unit**
1. As a lifter, I want a Settings screen with Kilograms and Pounds, so that I can pick the unit I train in.
2. As a lifter, I want a gear on Today that opens Settings, so that I can find it.
3. As a lifter, I want the app to start in kg on a fresh install, with no guess from my phone's region, so that the first screen is predictable. Onboarding (Phase 4) will ask.
4. As a lifter, I want my choice to survive closing the app, and to be part of a backup (Phase 3), so that I do not set it again on a new phone.

**Seeing weights**
5. As a lifter, I want every weight in the app shown in my unit: the live workout (Target banner, Last column, set rows, column header), the Offer, the workout summary (Targets, volume), the Today preview and the rest panel's "Next up" line, so that nothing reads in the wrong unit.
6. As a lifter, I want converted numbers rounded to 0.01 with trailing zeros dropped (ADR 0001), so that 135 lb reads 135, not 135.00.

**Typing weights**
7. As a lifter, I want a weight I type to be read in the unit on screen, so that typing 135 in lb means 135 lb.
8. As a lifter, I want it saved as kg (converted with `toKg`), with `entered_unit` set to the unit on screen when I check the set, so that the database holds one unit and still remembers what I typed.

**Switching in the middle of a workout**
9. As a lifter, I want a `kg | lb` pill in the live workout header, so that I can switch at a gym with different plates. It writes the same global preference as Settings.
10. As a lifter, I want everything on screen to convert when I switch: checked sets, typed-but-unchecked weights and prefilled Targets, so that nothing reads in the old unit.
11. As a lifter, I want an unchecked weight I have not edited to keep its exact kg value through a switch, so that 135 lb, shown as 61.23 kg, still saves as 135 lb. A weight I edit afterwards is read in the unit on screen.
12. As a lifter, I want switching back and forth any number of times to change no stored value, so that I can trust my history.

## Implementation Decisions

- **Preference store:** a single-row `user_settings` table (a key/value `settings` table already exists for internal flags) in SQLite with a `unit` column (`"kg" | "lb"`, default `"kg"`). One Drizzle migration. Later features add their columns to the same row. The row is created on first read if missing.
- **Read the unit** through one hook (for example `useUnit()`) so every screen re-renders when it changes. No screen reads the table directly.
- **Formatters take the unit.** The existing `formatWeight(kg, unit)` and `toKg` stay the single place conversion happens (`src/units`). The call sites that pass `"kg"` and print the word "kg" (`workout/[id].tsx`, `offer/[id].tsx`, `summary/[id].tsx`, `nextPreview.ts`, `bannerText.ts`, `cardLine.ts`, `restTimer.ts`) take the unit as an argument instead, and print the unit label from it.
- **Typed weights:** the live workout row keeps the exact kg value of an unedited weight, and keeps the typed text only after an edit. On check, kg = `toKg(typed, unit)` for an edited weight, or the kept kg value otherwise. `workoutQueries.ts` writes `enteredUnit` from the unit on screen, replacing the hard-coded `"kg"`.
- **Jump is untouched.** Targets still step by the fixed 2.5 kg (`src/workout/jump.ts`) until feature 2, so an lb lifter sees Targets such as 137.79 lb. This is accepted. Do not round the lb display to hide it, because that would break ADR 0001's "display rounds to 0.01".
- **Rest notification:** a notification already scheduled keeps the unit it was scheduled in. The next rest uses the current one.
- **Settings screen** lives at `src/app/settings.tsx` as a stack screen opened from the Today gear, using the design tokens and existing base components. It holds only the Units card.
- No ADR. ADR 0001 already covers the hard-to-reverse choice, and the `settings` table is easy to change later.

## Testing Decisions

- **Pure seams, tested with Jest:**
  - Formatting with a unit: a Target, a Last value, a volume, a "Next up" line, in kg and in lb (extend the existing tests next to each formatter).
  - The keep-exact-kg rule for an unedited weight across a unit switch, and the read-typed-text-in-the-current-unit rule after an edit.
- **Database test:** write a set at 135 lb (stored as 61.2349… kg, `entered_unit = lb`), switch the preference 10 times, and read the row back. `weight_kg` and `entered_unit` are identical, compared at full precision, not 0.01.
- **Search check:** no `"kg"` is passed to `formatWeight` anywhere in `src` (tests and the `gallery` demo screen excepted).
- **Owner check on a phone** (last ticket): log a workout in lb, switch to kg and back during it, finish it, and see that every number typed comes back exactly.
- Not unit-tested: the Settings screen and the pill (device check).
- Prior art: `src/units/units.test.ts`, and the existing formatter tests in `src/workout/`.

## Out of Scope

- Smallest-jump setting, "Rounded to the nearest weight you can load in lb" note, and the Jump row in Settings (feature 2).
- Default rest, show previous set, keep screen awake, theme (feature 3).
- Records and the "Bench press record" demo row in the mockup (feature 5).
- Exercise history screen (feature 4).
- Region-based default, and the onboarding unit question (Phase 4).
- Rescheduling a pending rest notification when the unit changes.

## Further Notes

- Odd lb Targets between this feature and feature 2 are expected, not a bug. 60 kg is 132.28 lb, and one step up is 62.5 kg, which shows as 137.79 lb.
- `docs/screens.md` says the Today gear and interactive kg/lb "arrive in Phase 2"; update both lines when this ships.
- The Settings and Workout mockups already match this spec; no mockup edit is needed.
- Glossary: **Unit** added.
