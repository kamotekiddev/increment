Status: ready-for-agent

# Phase 2 · Feature 2 · Weight jumps

Part of Phase 2 (see `.scratch/phase-2/map.md`). Needs: feature 1 (Settings and units). Decisions below come from a grilling session on 2026-11-19.

## Problem Statement

Every Target steps by one fixed 2.5 kg (`src/workout/jump.ts`). A dumbbell lifter cannot add 2.5 kg to a 8 kg lateral raise, and an lb lifter sees Targets such as 137.79 lb that no plate can make. This is the second half of the Phase 2 gate: every Target is loadable.

Pull-ups, dips and the other "bodyweight or weighted" exercises also confuse lifters: the app shows a weight box, yet the free rule steps them by reps only, so a lifter who wears a belt never gets a weight Target.

## Solution

A Weight jumps screen, opened from a "Weight jumps" row in Settings, with one row per equipment and a − / + control on each, in the lifter's unit. Each exercise steps by the Jump of its equipment, and Targets round to a multiple of it. The screen is free for everyone (Pro's rule panel in Phase 3 sets how and when progression happens, and still uses these Jumps).

Exercises done both with and without added weight become two exercises, so the weighted one steps by weight and the bodyweight one by reps.

The screen is drawn in the design canvas (`WeightJump.dc.html`, `Settings.dc.html`). Two things in the mockup change: the "Plates at your gym" section and its note sentence are left out (Phase 3), and a fifth row is added.

## User Stories

**Setting the Jump**
1. As a lifter, I want a "Weight jumps" row in Settings that opens a Weight jumps screen, so that I can find it.
2. As a lifter, I want one row each for Barbell, Dumbbell, Machine, Cable and "Bodyweight, added weight", with a short example line under each, so that I know which exercises use it.
3. As a lifter, I want − and + on each row, shown in my unit, so that I can set the smallest weight I can add.
4. As a lifter, I want the defaults 2.5, 2, 5, 2.5 and 2.5 kg, so that the screen works before I touch it.
5. As a lifter, I want my choice saved at once and kept after closing the app.

**Units**
6. As a lifter who uses both units, I want my Jump to follow me when I switch, shown as the nearest real plate step of the new unit, so that a Barbell Jump of 5 kg shows as 10 lb (not 11.02 lb) and as 5 kg again when I switch back, however often I switch. A Jump I never changed is the current unit's default (2.5 / 2 / 5 / 2.5 / 2.5 kg, 5 / 5 / 10 / 5 / 5 lb exactly), and switching unit never changes stored data (owner decision 2026-11-19, replacing separate kg and lb Jumps).
7. As a lifter in pounds, I want 135 lb to step to 140 lb after a 5 lb Jump, so that the Target is loadable.

**Targets**
8. As a lifter, I want a Target to step by the Jump of the exercise's equipment, and round to a multiple of it, so that I can load it.
9. As a lifter, I want EZ bar to use the Barbell Jump and kettlebell to use the Dumbbell Jump, so that no exercise is left without one.
10. As a lifter, I want a changed Jump to affect the next Target the app works out, not Targets already shown in a workout in progress.
11. As a lifter who switches unit, I want a Target set in the other unit to snap to the nearest multiple of my current Jump (a tie rounds up), so that I can load it and hit it. A 10 kg dumbbell Target is 22.05 lb, which a 20 / 25 lb rack cannot make: with a 5 lb Jump it shows as 20 lb, the prefilled sets are 20 lb, Go up offers 25 lb, and the Streak restarts at the new Target instead of the workout being a Hold forever. Changing a Jump in the same unit never moves a Target I already have.

**Bodyweight exercises**
12. As a lifter, I want Pull-up and Weighted pull-up as two exercises (likewise Chin-up, Dips, Bench dips, Hyperextensions, Glute ham raise), so that the weighted one steps by weight and the other by reps.
13. As a lifter, I want no weight box on a bodyweight exercise in the live workout, so that I am not asked for a weight that is not used.
14. As a lifter, I want the history I already logged to stay as it is.

## Implementation Decisions

- **Storage:** one Jump per equipment group on the `user_settings` row from feature 1 (`jump_barbell_kg` … `jump_bodyweight_kg`, migration 0005), nullable and stored in kg whichever unit set it (15 lb is stored as 6.80388555 kg). The effective Jump is the saved one converted to the current unit and snapped to the nearest rung of that unit's ladder, a tie rounding up: 5 kg (11.02 lb) is 10 lb, 2.5 kg (5.51 lb) is 5 lb, 1.25 kg (2.76 lb) is 2.5 lb, 2 kg (4.41 lb) is 5 lb. That value is what the screen shows, and its kg value is what the engine, the Settings row and the Targets step by. NULL means the lifter never changed that Jump: its effective Jump is the current unit's default (kg 2.5 / 2 / 5 / 2.5 / 2.5, lb 5 / 5 / 10 / 5 / 5), converted to kg for the engine. Switching unit never writes a Jump, so a stored 5 kg shows 10 lb in lb and 5 kg back in kg. Read through one hook, like `useUnit()`, which returns the effective Jumps in kg (owner decision 2026-11-19: one Jump that converts and snaps, replacing separate kg and lb Jumps).
- **− / + ladder:** one ladder per unit, real plate steps only: kg 0.5, 1, 1.25, 2, 2.5, 5, 10 and lb 1.25, 2.5, 5, 10, 15, 20. − and + move one rung from the shown (snapped) value in the current unit and save that rung in kg: in lb, 10 lb + gives 15 lb, saved as 6.80388555 kg, which shows as 5 kg back in kg. − stops at the bottom rung, + at the top (owner decision 2026-11-19).
- **Equipment to Jump:** a pure function maps an exercise's equipment to a Jump key: barbell and ez bar to Barbell; dumbbell and kettlebell to Dumbbell; machine to Machine; cable to Cable; a weighted exercise tagged bodyweight to "Bodyweight, added weight". The engine still receives one `jumpKg`; the caller looks it up. `JUMP_KG` is removed.
- **Rounding:** data rule 4. A step up goes to the next multiple of the Jump strictly above the current weight; a drop or deload rounds down. The Jump is stored in kg, so a lb lifter's 5 lb is 2.268 kg, and display rounds to 0.01 (ADR 0001).
- **Snap after a unit switch** (story 11, owner decisions 2026-11-19): a past Target (Hold, Stay, on track, baseline, an accepted stored Target) set in another unit than the lifter's current one snaps to the nearest multiple of the current Jump, an exact tie rounding up; a small tolerance leaves one already on the grid untouched. A Target set in the current unit never snaps, whatever the Jump: an accepted 62.5 kg stays 62.5 kg after the Barbell Jump changes to 5 kg. Start stores the current unit in `workout_exercises.target_unit` (nullable, migration 0007); `toHistory` falls back to the logged sets' `entered_unit` for older rows, then to kg, and a baseline uses the unit of the sets it comes from. The engine takes the current `unit` and each session's `targetUnit` as plain inputs and snaps with `inCurrentUnit` (`nearestMultiple` in `src/engine/rounding.ts`) before stepping, so a step up goes one Jump above the snapped Target (Stay 140 lb, Go up 145 lb). Start, the Today preview, the Offer and the summary all use it, so they agree. Bodyweight Targets (0) are untouched, stored sets never change, and a snapped Target is a changed Target, so the Streak restarts. Examples: 10 kg with a 5 lb Jump is 20 lb, 62.5 kg is 140 lb, 50 kg with a 10 lb Jump is 110 lb, 135 lb with a 2.5 kg Jump is 60 kg.
- **Library split:** the six `bodyweight_or_weighted` exercises each become two exercises, one `bodyweight` and one `weighted` (equipment `bodyweight`, which maps to the added-weight Jump). Update `exercises.json` and the seed. Workouts already logged keep their exercise; the old exercise becomes the bodyweight one. The load type `bodyweight_or_weighted` is removed from the type, schema and engine.
- **Live workout:** hide the weight box on `bodyweight` exercises. A bodyweight set stores weight 0.
- **Settings:** a "Weight jumps" row in the Units card, with no value (the screen holds one Jump per equipment, so no single number fits), opens `src/app/weight-jumps.tsx`, built from the design tokens and the existing base components.
- **Accepted Target:** Go up saves the Target the Offer showed on `workout_exercises` (`accepted_target_weight_kg`, `accepted_target_reps`, migration 0006), and the next Start and the summary's next Target use it as is, so only later steps use a changed Jump (story 10). Go up also stores the lifter's unit at that moment (`accepted_target_unit`, migration 0007), and the accepted Target snaps only when that unit differs from the current one (story 11): 62.5 kg started in kg, finished in lb and accepted as 145 lb starts back in kg at 65 kg, never 65.77 kg. A row with no stored unit uses its Target's unit (`target_unit` and its fallbacks). Stay stores null. Accepted rows saved before this have no stored Target and still recompute the step with the current Jump.
- No ADR. ADR 0001 covers kg storage.

## Testing Decisions

- **Pure seams (Jest):** equipment to Jump key; the nextTarget step and rounding with each Jump in kg and in lb values (135 lb + 5 lb = 140 lb); an lb lifter at 62.5 kg (137.79 lb, set in kg) with a 5 lb Jump stays at 140 lb or goes up to 145 lb; a saved Jump shown in the other unit (5 kg is 10 lb and back to 5 kg; 2.5 kg is 5 lb, 1.25 kg is 2.5 lb, 2 kg is 5 lb; a tie rounds up); an lb lifter with a 5 kg Barbell Jump steps by 10 lb (140 lb goes up to 150 lb); the ladder in each unit (5 lb + gives 10, − gives 2.5; in lb, 10 lb + gives 15 lb saved in kg; 5.51 lb shows as 5 lb, so + gives 10 and − gives 2.5) and bounds of − and +; the snap after a unit switch (10 kg with 5 lb is 20 lb, 62.5 kg is 140 lb, 50 kg with 10 lb is 110 lb, 135 lb with 2.5 kg is 60 kg, a tie rounds up, a Target on the new grid is unchanged, a Target set in the current unit never snaps after a Jump change, a baseline uses its sets' unit, a snapped Target restarts the Streak); `toHistory`'s unit fallback (stored unit, then sets' `entered_unit`, then kg); the summary's Offer (Stay 140 lb, Go up 145 lb).
- **Database tests (snap):** a dumbbell routine with a finished workout at a 10 kg Target; Start in kg gives 10 kg and stores `target_unit` kg; finish it, switch to lb and Start again: the Target and the prefilled sets show 20 lb, and the logged sets are still 10 kg. An old row with no stored unit and sets logged in lb (135 lb) starts in kg at 62 kg (2 kg Dumbbell grid). A 10 kg Target with the Dumbbell Jump changed to 4 kg starts at 10 kg. An accepted 62.5 kg starts at 62.5 kg after the Barbell Jump changes to 5 kg.
- **Database test:** set Barbell to 5 kg, switch to lb: it shows 10 lb; switch back: 5 kg. After 10 switches the stored value is still exactly 5 kg, and the untouched Jumps are still NULL and show 5 lb in lb and 2.5 kg in kg. In lb, + from 10 lb saves 15 lb in kg.
- **Seed test:** no exercise has load type `bodyweight_or_weighted`; each split pair exists.
- **Search check:** `JUMP_KG` no longer appears in `src`.
- **Owner check on a phone:** set Dumbbell to 1 kg and Barbell to 5 lb, finish a Clean streak, and see a loadable Target; do a Pull-up (no weight box) and a Weighted pull-up.
- Not unit-tested: the screen (device check).

## Out of Scope

- Plates, "Plates at your gym" and the plate calculator (Phase 3).
- A per-exercise Jump override ("unless you set your own"): part of the Pro rule panel (Phase 3).
- Pro rule panel and step types.
- Default rest, show previous set, keep screen awake, theme (feature 3).

## Further Notes

- Update `docs/decisions.md` (Phase 1 Jump line), `docs/architecture.md` (`user_settings`, load types), `docs/product.md` and `docs/screens.md` (Weight jumps note: no plates) in the same change.
- Update the mockup: remove the plates section and the plates sentence, add the fifth row.
- Glossary: **Jump** is per equipment, and **Load type** has two values (done).
