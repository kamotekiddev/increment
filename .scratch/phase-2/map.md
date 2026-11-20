# Phase 2 · Progress, units, settings: map

Gate (from the roadmap): switching units never changes stored data, and every Target is loadable. Checked by the owner after feature 7.

Phase 2 is split into seven features, the same way as Phase 1. Each feature ends with something usable on a phone, gets its own full spec at `.scratch/phase-2/<feature-slug>/spec.md` when it becomes next (not before), and is built on its own branch from `main`.

## Features, in build order

| # | Feature | Needs first |
|---|---|---|
| 1 | Settings and units | Phase 1 |
| 2 | Weight jumps | 1 |
| 3 | Workout settings | 1 |
| 4 | Exercise history | 1 |
| 5 | Records | 4 |
| 6 | Progress tab | 5 |
| 7 | Reminders | 1 |

### 1 · Settings and units
The Settings screen (gear on Today) with an interactive kg/lb preference, also switchable during a workout. Every weight shown in the app converts for display only; stored kg and `entered_unit` never change (ADR 0001). This is the first half of the gate.

### 2 · Weight jumps
The Weight jumps screen: one Jump per equipment (Barbell, Dumbbell, Machine, Cable, Bodyweight added weight), set with − / + through real plate steps and shown in the lifter's unit as the nearest step. Replaces the fixed 2.5 kg constant. Targets round to a multiple of the Jump, and a Target set in the other unit snaps to the new unit's grid. The six "bodyweight or weighted" exercises split into twins. This is the second half of the gate: a Target the lifter can load. Spec and tickets: `weight-jumps/`.

### 3 · Workout settings (built)
Default rest, show previous set and keep screen awake. Each one is wired to the screen it changes (the starting Rest length of a newly added Routine exercise, the live workout Last column, the live workout wake lock). Light/dark theme is not in this feature (see Decisions so far).

### 4 · Exercise history
The History tab on Exercise detail opens Exercise history: past sessions for one exercise, newest first, with sets in the lifter's unit. No record tags yet.

### 5 · Records
Heaviest set, estimated 1-rep max and most volume, worked out from logged sets and never stored (data rule 2). Shown as record pills on Exercise history and as records on the workout summary.

### 6 · Progress tab
Exercise picker, top set and a records list. Free users see a chart preview only; charts and All records arrive with Pro in Phase 3.

### 7 · Reminders
Workout reminders in Settings, with the notification permission asked there. Reuses the rest timer's one-time permission ask, so a denial there is not asked again.

## Decisions so far
- Split by what the lifter can use on the device, not by screen.
- Units and Jump come first because they are the gate, and every later feature shows weights.
- Features 3, 4 and 7 depend only on feature 1, so they can move earlier if the owner wants.
- Charts, All records and the plate calculator stay in Phase 3, as in the roadmap.

- Feature 2 (2026-11-19): free for everyone; plates and a per-exercise Jump override wait for Phase 3; pull-ups and similar split into bodyweight and weighted twins instead of one exercise with an optional belt.
- Feature 3 (2026-11-20): Default rest only sets the starting Rest length of exercises added afterwards, never existing ones, and is a − / + stepper reusing `clampRest` (15 s steps, 15 s to 10 min, default 90 s). Show previous set off hides the whole Last column (weighted and bodyweight), the Target banner and prefilled values stay, default on. Keep screen awake defaults on and applies only on the live workout screen. Light/dark theme is deferred out of feature 3: there is no dark token set yet, so it needs its own feature or Phase 4 polish.

## Open
- Resolved 2026-11-19: "Your gym's plates" moves to Phase 3 with the plate calculator; feature 2 covers the Jump only.
- Resolved 2026-11-20: light/dark theme leaves feature 3 (no dark tokens yet). Where it lands instead (own feature or Phase 4 polish) is still open.
