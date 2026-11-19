Status: ready-for-agent

# Phase 2 · Feature 2 · Weight jumps

Part of Phase 2 (see `.scratch/phase-2/map.md`). Needs: feature 1 (Settings and units). Decisions below come from a grilling session on 2026-11-19.

## Problem Statement

Every Target steps by one fixed 2.5 kg (`src/workout/jump.ts`). A dumbbell lifter cannot add 2.5 kg to a 8 kg lateral raise, and an lb lifter sees Targets such as 137.79 lb that no plate can make. This is the second half of the Phase 2 gate: every Target is loadable.

Pull-ups, dips and the other "bodyweight or weighted" exercises also confuse lifters: the app shows a weight box, yet the free rule steps them by reps only, so a lifter who wears a belt never gets a weight Target.

## Solution

A Weight jumps screen, opened from a "Smallest weight jump" row in Settings, with one row per equipment and a − / + control on each, in the lifter's unit. Each exercise steps by the Jump of its equipment, and Targets round to a multiple of it. The screen is free for everyone (Pro's rule panel in Phase 3 sets how and when progression happens, and still uses these Jumps).

Exercises done both with and without added weight become two exercises, so the weighted one steps by weight and the bodyweight one by reps.

The screen is drawn in the design canvas (`WeightJump.dc.html`, `Settings.dc.html`). Two things in the mockup change: the "Plates at your gym" section and its note sentence are left out (Phase 3), and a fifth row is added.

## User Stories

**Setting the Jump**
1. As a lifter, I want a "Smallest weight jump" row in Settings that opens a Weight jumps screen, so that I can find it.
2. As a lifter, I want one row each for Barbell, Dumbbell, Machine, Cable and "Bodyweight, added weight", with a short example line under each, so that I know which exercises use it.
3. As a lifter, I want − and + on each row, shown in my unit, so that I can set the smallest weight I can add.
4. As a lifter, I want the defaults 2.5, 2, 5, 2.5 and 2.5 kg, so that the screen works before I touch it.
5. As a lifter, I want my choice saved at once and kept after closing the app.

**Units**
6. As a lifter who uses both units, I want kg and lb to keep their own Jumps, so that 2.5 kg stays 2.5 kg and 5 lb stays 5 lb however often I switch (not 2.5 kg shown as 5.51 lb, or 5 lb shown as 2.27 kg). A Jump I never changed is that unit's default (5 lb, 5 lb, 10 lb, 5 lb, 5 lb exactly in lb). Setting a Jump in one unit never changes the other, and switching unit never changes stored data.
7. As a lifter in pounds, I want 135 lb to step to 140 lb after a 5 lb Jump, so that the Target is loadable.

**Targets**
8. As a lifter, I want a Target to step by the Jump of the exercise's equipment, and round to a multiple of it, so that I can load it.
9. As a lifter, I want EZ bar to use the Barbell Jump and kettlebell to use the Dumbbell Jump, so that no exercise is left without one.
10. As a lifter, I want a changed Jump to affect the next Target the app works out, not Targets already shown in a workout in progress.

**Bodyweight exercises**
11. As a lifter, I want Pull-up and Weighted pull-up as two exercises (likewise Chin-up, Dips, Bench dips, Hyperextensions, Glute ham raise), so that the weighted one steps by weight and the other by reps.
12. As a lifter, I want no weight box on a bodyweight exercise in the live workout, so that I am not asked for a weight that is not used.
13. As a lifter, I want the history I already logged to stay as it is.

## Implementation Decisions

- **Storage:** each unit keeps its own Jumps on the `user_settings` row from feature 1: five kg Jumps (`jump_barbell_kg` … `jump_bodyweight_kg`, migration 0005) and five lb Jumps (`jump_lb_barbell_kg` … `jump_lb_bodyweight_kg`, migration 0007), one per equipment group, all nullable and all stored in kg (5 lb is stored as 2.26796185 kg). The lifter's current unit picks which five are used, for the engine, the screen and the Settings row; the other unit's are never read or converted. NULL means the lifter never changed that Jump in that unit: its effective Jump is that unit's default (kg 2.5 / 2 / 5 / 2.5 / 2.5, lb 5 / 5 / 10 / 5 / 5), converted to kg for the engine. The first − or + saves the value in kg into the current unit's column only; switching unit never writes a Jump. Read through one hook, like `useUnit()`, which returns the current unit's effective Jumps in kg.
- **− / + ladder:** one ladder per unit, real plate steps only: kg 0.5, 1, 1.25, 2, 2.5, 5, 10 and lb 1.25, 2.5, 5, 10, 15, 20. − and + move one rung; a saved value off the ladder moves to the next rung up or down. − stops at the bottom rung, + at the top (owner decision 2026-11-19).
- **Equipment to Jump:** a pure function maps an exercise's equipment to a Jump key: barbell and ez bar to Barbell; dumbbell and kettlebell to Dumbbell; machine to Machine; cable to Cable; a weighted exercise tagged bodyweight to "Bodyweight, added weight". The engine still receives one `jumpKg`; the caller looks it up. `JUMP_KG` is removed.
- **Rounding:** unchanged (data rule 4). A step up goes to the next multiple of the Jump strictly above the current weight; a drop or deload rounds down. The Jump is stored in kg, so a lb lifter's 5 lb is 2.268 kg, and display rounds to 0.01 (ADR 0001).
- **Library split:** the six `bodyweight_or_weighted` exercises each become two exercises, one `bodyweight` and one `weighted` (equipment `bodyweight`, which maps to the added-weight Jump). Update `exercises.json` and the seed. Workouts already logged keep their exercise; the old exercise becomes the bodyweight one. The load type `bodyweight_or_weighted` is removed from the type, schema and engine.
- **Live workout:** hide the weight box on `bodyweight` exercises. A bodyweight set stores weight 0.
- **Settings:** a "Smallest weight jump" row in the Units card, showing the Barbell value, opens `src/app/weight-jumps.tsx`, built from the design tokens and the existing base components.
- **Accepted Target:** Go up saves the Target the Offer showed on `workout_exercises` (`accepted_target_weight_kg`, `accepted_target_reps`, migration 0006), and the next Start and the summary's next Target use it as is, so only later steps use a changed Jump (story 10). Stay stores null. Accepted rows saved before this have no stored Target and still recompute the step with the current Jump.
- No ADR. ADR 0001 covers kg storage.

## Testing Decisions

- **Pure seams (Jest):** equipment to Jump key; the nextTarget step and rounding with each Jump in kg and in lb values (135 lb + 5 lb = 140 lb); an lb lifter at 62.5 kg (137.79 lb) with a 5 lb Jump steps to 140 lb; the Jump display in both units; the ladder in each unit (5 lb + gives 10, − gives 2.5; 5.51 lb snaps to 10 or 5) and bounds of − and +.
- **Database test:** set Barbell to 2.5 kg and to 5 lb, switch the unit 10 times, read both back: kg shows 2.5 and lb shows 5, identical at full precision, and the untouched Jumps in both units still NULL. Setting a Jump in lb never changes the kg Jump.
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
