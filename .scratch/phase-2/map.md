# Phase 2 · Progress, units, settings: map

Gate (from the roadmap): switching units never changes stored data, and every Target is loadable. Checked by the owner after feature 7.

Phase 2 is split into seven features, the same way as Phase 1. Each feature ends with something usable on a phone, gets its own full spec at `.scratch/phase-2/<feature-slug>/spec.md` when it becomes next (not before), and is built on its own branch from `main`.

## Features, in build order

| # | Feature | Needs first |
|---|---|---|
| 1 | Settings and units | Phase 1 |
| 2 | Weight jumps | 1 |
| 3 | Workout settings | 1 |
| 4 | Workout history | 1 |
| 5 | Records | 4 |
| 6 | Progress tab | 5 |
| 7 | Reminders | 1 |

### 1 · Settings and units
The Settings screen (gear on Today) with an interactive kg/lb preference, also switchable during a workout. Every weight shown in the app converts for display only; stored kg and `entered_unit` never change (ADR 0001). This is the first half of the gate.

### 2 · Weight jumps
The Weight jumps screen: one Jump per equipment (Barbell, Dumbbell, Machine, Cable, Bodyweight added weight), set with − / + through real plate steps and shown in the lifter's unit as the nearest step. Replaces the fixed 2.5 kg constant. Targets round to a multiple of the Jump, and a Target set in the other unit snaps to the new unit's grid. The six "bodyweight or weighted" exercises split into twins. This is the second half of the gate: a Target the lifter can load. Spec and tickets: `weight-jumps/`.

### 3 · Workout settings (built)
Default rest, show previous set and keep screen awake. Each one is wired to the screen it changes (the starting Rest length of a newly added Routine exercise, the live workout Last column, the live workout wake lock). Light/dark theme is not in this feature (see Decisions so far).

### 4 · Workout history (built)
A list of the lifter's finished Workouts, newest first (date, Routine name). Opening one shows each of its exercises with the done Working sets in the lifter's unit. No record tags yet. A History button on the Progress tab opens it (owner decision 2026-11-20), one list across all Routines. Each row: date, Routine name, number of exercises and duration (`Thu, 12 Nov · Push day A`, `5 exercises · 48 min`), under month headers. A row opens Past workout: Routine name, date and duration, then the exercises as rows with dividers in one white card, each with its name, the Target it had (`Target 62.5 × 8`, none on a first workout), a grey Deload pill at the right end of the name row when it was one, and the done Working sets as chips (`62.5 × 8`, or `9 reps` with no weight). No Clean / Hold / Miss label. The History button is always on Progress; with no finished Workout the list shows a "No workouts yet" card. Exercise detail has no History tab: it shows How to only. Spec and tickets: `workout-history/`.

### 5 · Records (built)
Heaviest set, estimated 1-rep max and most volume, worked out from logged sets and never stored (data rule 2); a bodyweight exercise has Most reps in a set and Most reps in a workout instead. Shown as short "New" pills on Past workout and on the workout summary (owner decision 2026-11-22; not on the History list rows). Spec and tickets: `records/`.

### 6 · Progress tab (built)
Exercise picker, top set and a records list. Free users see a chart preview only; charts and All records arrive with Pro in Phase 3. Designed 2026-11-22 (canvas: Progress, Progress no workout yet, Progress bodyweight exercise; see `docs/screens.md`). Spec and tickets: `progress-tab/`.

### 7 · Reminders
Workout reminders in Settings, with the notification permission asked there. Reuses the rest timer's one-time permission ask, so a denial there is not asked again. A Reminders card between Workout and Data (a Training day reminders switch, off by default, a Time row opening the phone's time picker, default 6:00 PM, and a note with the days), drawn on the canvas as `SettingsReminders`, `SettingsReminderTime`, `SettingsRemindersNoDays` and `SettingsRemindersDenied`. Spec: `reminders/`.

## Decisions so far
- Split by what the lifter can use on the device, not by screen.
- Units and Jump come first because they are the gate, and every later feature shows weights.
- Features 3, 4 and 7 depend only on feature 1, so they can move earlier if the owner wants.
- Charts, All records and the plate calculator stay in Phase 3, as in the roadmap.

- Feature 2 (2026-11-19): free for everyone; plates and a per-exercise Jump override wait for Phase 3; pull-ups and similar split into bodyweight and weighted twins instead of one exercise with an optional belt.
- Feature 3 (2026-11-20): Default rest only sets the starting Rest length of exercises added afterwards, never existing ones, and is a − / + stepper reusing `clampRest` (15 s steps, 15 s to 10 min, default 90 s). Show previous set off hides the whole Last column (weighted and bodyweight), the Target banner and prefilled values stay, default on. Keep screen awake defaults on and applies only on the live workout screen. Light/dark theme is deferred out of feature 3: there is no dark token set yet, so it needs its own feature or Phase 4 polish.
- Feature 4 (2026-11-20): history is per Workout, not per exercise. Exercise history (a History tab on Exercise detail) was built on PR #19, then dropped: the engine's Target, the live workout's Last column and the Progress tab's exercise picker already answer "what did I lift on this exercise", while nothing showed what was done in a past Workout. Its spec stays in `exercise-history/` as `wontfix`.
- Feature 4 (2026-11-21): the Progress tab gets only its title row and the History pill until feature 6 (no "Last 8"). Duration is finish minus start, floored, as on the summary, read `48 min` / `1 h` / `1 h 12 min`, no cap. A past Target converts to the current Unit like its sets, never snapped. Past workout is read-only. Tests go through one seam, the history read module, against an in-memory database.
- Set units (2026-11-21): a set stores the number typed and its unit (ADR 0003, superseding ADR 0001 for sets); the unit is display only; only weights about to be lifted are rounded to the Jump, and only when they came from the other unit; history shows "≈" and one decimal. See `set-units/spec.md`.

- Feature 5 and 6 (2026-11-22, owner decision): records are per exercise. The Progress tab is redesigned around a Records card (Heaviest set, Estimated 1-rep max, Most volume) with a locked chart preview for free users; the "Last 8" dropdown and the weight / est. max / volume toggle are dropped for free users. A bodyweight exercise shows Most reps in a set and Most reps in a workout instead. Feature 5 decisions (2026-11-22): pills on Past workout and the summary; the first workout of an exercise sets a silent baseline; Heaviest set is the highest weight, with more reps at the same weight also counting; Estimated 1-rep max is Epley with sets over 12 reps ignored; Most volume is per exercise per workout; Heaviest set shown as in History, 1-rep max and volume as whole numbers; only done Working sets of finished workouts count. See `records/spec.md`.

- Feature 7 (2026-11-23, owner decisions): reminders fire only on days with at least one Routine planned and follow the Routines' days (no separate day picker); one time for every day, default 6:00 PM; a day with a Workout already started on it, from any Routine, gets none, so reminders are scheduled per date for the next 4 weeks and refreshed at launch, on return to the app, at Start and Discard and on any Routine or setting change; the text is `<Routine> today` / `N exercises planned` (`<A> and <B> today` / `2 workouts planned`), with no Target or Earned line; the switch turns on only with permission, a denial shows "Notifications are off for Increment." with Open settings and never prompts again, and a permission revoked later keeps the saved choice; a tap opens Today and nothing shows while the app is open; off by default. See `reminders/spec.md`.

## Open
- Resolved 2026-11-19: "Your gym's plates" moves to Phase 3 with the plate calculator; feature 2 covers the Jump only.
- Resolved 2026-11-20: light/dark theme leaves feature 3 (no dark tokens yet). Where it lands instead (own feature or Phase 4 polish) is still open.
