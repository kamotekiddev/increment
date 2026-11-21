# 0003: A set stores the weight as typed, with its unit

**Status:** accepted (owner decision 2026-11-21). Supersedes [0001](0001-weights-stored-in-kg.md) for sets. Targets and Jumps stay in kg.

## Context

ADR 0001 stored every set weight in kg, with the unit the lifter typed (`entered_unit`) beside it. It kept stored data stable across unit switches, but the number in the database was never the number the lifter typed: 135 lb was 61.2349… kg, recovered only by converting back and rounding for display. A later per-exercise unit (a gym with kg barbells and lb dumbbells) is easier to build when each set already holds its own number and unit.

## Decision

- **Save exactly what was entered.** Each set stores the number typed (`sets.weight`) and the unit it was typed in (`sets.weight_unit`). Nothing is converted or rounded on save.
- **The unit preference is display only.** Switching it writes one settings value and never a set, even mid-workout.
- **Round only the weights about to be lifted.** Pre-filled rows, the live workout's Last column and Targets are shown in the current unit; one that came from the other unit is converted and rounded to the Jump (100 kg is 220 lb with a 5 lb Jump). A value already in the current unit is never rounded (61.25 kg stays 61.25 kg).
- **History shows the truth.** A logged set in the current unit shows exactly; one in the other unit shows converted to one decimal with "≈" ("≈20.4 kg" for 45 lb), never rounded to a plate weight.
- **Math is in kg, in memory only.** The engine, records, volume and charts convert each set to kg (1 lb = 0.45359237 kg) and show results in the current unit to one decimal. Converted values are never saved.
- **One conversion module.** All kg/lb math lives in `src/units`. The one exception is migration 0009, which inverts the old kg storage in SQL.

## Migration

Migration 0009 renames `weight_kg` to `weight` and `entered_unit` to `weight_unit`. A set logged in lb gets its typed number back (`ROUND(weight_kg / 0.45359237, 6)`, so 135 lb is 135). Each logged set keeps its own unit, not the current preference, because the old app stamped the unit when the set was checked. An open set of a workout in progress takes the current preference (or kg), because its `entered_unit` was a placeholder and its weight was shown and typed in that unit.

## Alternatives considered

- **Keep ADR 0001.** It already met "switching never changes stored data". Rejected by the owner: the stored number should be what was typed.
- **Store every Target and Jump as typed too.** Targets already record their unit (`target_unit`), and Jumps are one kg value per equipment shown on the current unit's ladder. Changing them adds columns for no behavior change.
- **Fill `weight_unit` from the global preference at migration.** Wrong here: the old app recorded each checked set's unit, so a lifter who logged lb and later switched to kg would have had 135 lb relabelled as 61.23 kg.

## Consequences

- Records, volume and the engine must convert sets to kg before comparing or adding: 225 lb (102.06 kg) beats 100 kg.
- An open row the lifter has not touched follows the unit on screen by display only; it is saved in the new unit, rounded, when it is checked or edited. So that rounding down never turns a clean workout into a Hold, a set logged in another unit than its Target is judged against the Target as shown (snapped to the current unit's Jump): 220 lb meets a 100 kg Target. Each set carries its unit into the engine for this.
- The backup file (Phase 3) carries `weight` and `weight_unit` for every set from its first version, so no backup lacks per-set units.
