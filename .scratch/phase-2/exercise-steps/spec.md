Status: ready-for-agent

# Phase 2 · Exercise steps: a kg and lb step per routine exercise, rounding down, a free rule panel

Decisions from a grilling session with the owner on 2026-11-21, after comparing competitors (StrongLifts sets an increment per exercise and rounds down to a usable weight on a unit switch). Not built yet. Builds on `set-units/` (ADR 0003), which must be merged first.

## Problem Statement

A Target or pre-fill can land on a weight the lifter can't load. The Jump is one value per equipment group, saved in kg and shown as the nearest step in the other unit. So one rack that differs from the default breaks every exercise on that equipment (2 kg dumbbells, but a 2.5, 5, 7.5 kg rack). Moving a Jump in lb also changes it in kg: 5 lb saved as 2.27 kg shows as 2.5 kg back in kg, not the 2 kg the lifter had. Most lifters never open the Weight jumps screen, and the step a lifter would tune per lift (a 1 kg overhead press, a 5 kg deadlift) sits behind Pro in the rule panel.

## Solution

1. **A step per routine exercise, one for each unit.** Each routine exercise has `step_kg` and `step_lb` ("Add each time"), both null until set. A null step uses the default: **2.5 kg / 5 lb for every exercise**, as StrongLifts does. The engine steps by the step for the lifter's current unit. Switching unit never writes a step.
2. **The Weight jumps screen is removed.** The step is set where the routine is built: in the Overload rule panel, opened from the Exercise setup sheet when adding or editing an exercise in a routine. "Add each time" offers that unit's real plate steps (kg 0.5, 1, 1.25, 2, 2.5, 5, 10; lb 1.25, 2.5, 5, 10, 15, 20).
3. **The Overload rule panel is free.** Rule type (Weight first, Double progression, Reps only), "Add each time", the miss rule and Deload weeks are all free. This changes the free/Pro split.
4. **Round down after a unit switch.** A weight that came from the other unit goes to the largest multiple of the current step at or below it: 62.5 kg is 135 lb (not 140), 24 kg is 50 lb, 100 kg is 220 lb, 60 kg is 130 lb, 135 lb is 60 kg. This replaces "nearest, a tie rounds up" everywhere a weight is snapped: Targets set in the other unit, accepted Targets, baselines, pre-filled rows, live rows after a Settings switch (`followUnit`), and the Last column. A weight already in the current unit is still never rounded.
5. **Judging after a switch** compares a set with the Target rounded down the same way, so lifting the shown 135 lb against a 62.5 kg Target is Clean.

## Migration

- Add nullable `step_kg` and `step_lb` (real) to `routine_exercises`.
- Drop the `jump_*_kg` columns from `user_settings` without copying them (owner decision 2026-11-21: the app is not released, so no real lifter has set a Jump). Every routine exercise starts at 2.5 kg / 5 lb.
- The defaults change for untouched Jumps: Dumbbell 2 kg becomes 2.5 kg; Machine 5 kg / 10 lb becomes 2.5 kg / 5 lb. A lifter sets a different step on the exercises that need one (a 5 kg leg press or deadlift), which is why the step is per exercise.

## Out of Scope

- Asking for steps in onboarding (Phase 4 per the roadmap): "Your dumbbells go: 2, 4, 6 … / 2.5, 5, 7.5 …".
- A step per exercise across routines (it is per routine exercise, like the rule).
- Uneven racks (1 kg steps up to 10, then 2.5 kg) and plates the lifter owns: the plate calculator in Phase 3.

## Docs to change when built

- `docs/product.md`: the free/Pro table ("Overload rules: 1 simple / Your own") and the Weight jumps paragraph.
- `docs/agents/rules/product.md` rule 7 (the free limits).
- `docs/agents/rules/data.md` rule 4 (round down; the Jump becomes the routine exercise's step).
- `docs/architecture.md`: `routine_exercises`, `user_settings`, the Units and engine sections.
- `docs/screens.md`: remove Weight jumps; the Exercise setup sheet and rule panel.
- `docs/decisions.md`: replace the "Jump per equipment" and "A Target set in the other unit snaps" entries.
- `GLOSSARY.md`: Jump.
- The design canvas: Settings (Weight jumps row), WeightJump, RoutineSetup (Pro badge on Progression), RoutineRule (Pro badge; kg and lb steps).

## Resolved at triage (2026-11-21)

- One default (2.5 kg / 5 lb) for every exercise stays: the step is per exercise so a lifter tunes the ones that differ.
- The old Jumps are dropped, not copied.
- A round trip can lose an earned step, accepted for now (owner, 2026-11-21): 62.5 kg shows as 135 lb, Go up is 140 lb (63.5 kg), and back in kg that rounds down to 62.5 kg.
