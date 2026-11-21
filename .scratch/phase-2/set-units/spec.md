Status: ready-for-agent

# Phase 2 · Set units: save each set exactly as typed

A change to Feature 1 (Settings and units). Decisions come from a grilling session with the owner on 2026-11-21. Recorded in [ADR 0003](../../../docs/adr/0003-sets-store-the-weight-as-typed.md), which supersedes ADR 0001 for sets.

## Problem Statement

A set was stored in kg with the unit it was typed in beside it. The number in the database was never what the lifter typed (135 lb was 61.2349… kg). After a Settings change mid-workout, untouched rows kept their kg and showed weights that can't be loaded (100 kg as 220.46 lb). The Last column showed past sets from the other unit the same way.

## Solution

1. **Save exactly what was entered.** `sets.weight` is the typed number and `sets.weight_unit` its unit. Nothing is rounded or converted on save. A comma works as the decimal separator ("62,5" is 62.5).
2. **The unit is a display preference only.** Switching it writes `user_settings.unit` and never a set.
3. **Round only the weights about to be lifted**, to the Jump of the exercise's equipment (not a step per exercise), and only when they came from the other unit:
   - Pre-fill at Start: the engine's Target as a number in the current unit (it is already on the Jump's grid). 100 kg last time, lb now, 5 lb Jump: 220 lb. 60 kg: 130 lb. 135 lb in kg with a 2.5 kg Jump: 60 kg.
   - Mid-workout unit change: a row neither typed nor checked shows in the new unit, rounded (100 kg is 220 lb), and is saved that way when checked or edited. Typed and checked rows keep their number and unit.
   - Last column: a set logged in the other unit is rounded to the Jump (100 kg is "220 × 8" in lb). One logged in the current unit is shown exactly (61.25 kg stays 61.25).
   - The live banner's Target after a mid-workout switch snaps to the grid, as the engine does at Start.
   - Judging: a set logged in another unit than its Target is compared with the Target as shown in that unit (snapped to the current unit's Jump), so 3 × 220 lb against a 100 kg Target is Clean, not Held. A set in the Target's unit is judged against the stored Target.
4. **History shows the truth.** A set in the current unit shows exactly; one in the other unit shows "≈" and one decimal ("≈20.4" for 45 lb in kg). Never a plate weight. `loggedWeightText` in `src/units` is ready for the Past workout screen (Feature 4), which is not built yet.
5. **Math in kg, in memory only.** The engine, the summary's volume and (later) records and charts convert each set to kg. 225 lb (102.06 kg) beats 100 kg. Volume is shown to one decimal.
6. **One conversion module.** All kg/lb math is in `src/units`. Migration 0009's SQL is the one exception.

## Migration 0009

Renames `weight_kg` to `weight` and `entered_unit` to `weight_unit`. A set logged in lb gets its typed number back (`ROUND(weight / 0.45359237, 6)`). A logged set keeps its own unit, whatever the preference. An open set of a workout in progress takes the current preference (or kg), since its old unit was a placeholder. Targets and Jumps are unchanged.

## Out of Scope

- Targets and Jumps stay in kg (`target_weight_kg` + `target_unit`, `jump_*_kg`).
- Backup and restore are Phase 3. The backup file carries `weight` and `weight_unit` for every set from its first version, so no backup lacks per-set units.
- A per-exercise unit (kg barbells, lb dumbbells) comes later; storing the unit on each set already allows it.
- Records, charts and the Past workout screen are later features. They must use `weightKg` for math and `loggedWeightText` for display.

## Acceptance tests

1. Switching kg → lb → kg ten times leaves every stored set unchanged, open rows included (`src/settings/unitSetting.test.ts`).
2. to 4. Pre-fills: 220 lb, 130 lb, 60 kg (`src/workout/startWorkout.test.ts`).
5. 45 lb shows "45 lb" in lb and "≈20.4 kg" in kg; the database holds `45, lb` (`src/settings/unitSetting.test.ts`).
6. 225 lb beats 100 kg (`src/workout/historyInputs.test.ts`, `src/units/units.test.ts`).
7. "62,5" saves as 62.5 (`src/workout/parseInput.test.ts`).
8. Migration: logged lb sets keep lb and their typed value; logged kg sets stay kg; open sets take the preference (`src/db/migrations.test.ts`).
9. Backup round trip: Phase 3.
