# Architecture

## Principles
- **Offline-first, no backend.** All data lives in SQLite on the phone, and the app stores handle payment.
- **One source of truth per value.** A set stores its weight as typed with its unit, Targets and Jumps are kg, and records are derived from sets rather than stored.
- **Pure logic is tested.** The overload engine and unit conversion are plain functions covered by unit tests.

## Stack
| Need | Choice |
|---|---|
| App framework | Expo (React Native) + TypeScript, Expo Router |
| Local database | SQLite (expo-sqlite) + Drizzle ORM, with migrations |
| App state | Zustand (first store: the rest timer, `src/workout/restStore.ts`, so it survives leaving the live screen) |
| UI | Own components on the Increment tokens, Sora font |
| Charts | Victory Native (Skia) |
| One-time purchase | react-native-iap (StoreKit 2 / Google Play Billing) |
| Reminders and rest-over alert | expo-notifications, local only (the rest timer uses it in Phase 1) |
| Rest timer extras | react-native-svg (progress ring), expo-haptics (buzz at zero) |
| Backup, export, PDF | expo-file-system, expo-sharing, expo-document-picker, expo-print |
| Builds and release | EAS Build, EAS Submit |
| Tests | Jest (logic), Maestro (flows) |

## Data model (first draft)
- **exercises**: id, slug, name, muscles, equipment, instructions, load_type (weighted, bodyweight), is_custom
- **routines**: id, name, days (bitmask), position
- **routine_exercises**: routine_id, exercise_id, position, sets, rep_min, rep_max, rest_s, rule (JSON)
- **workouts**: id, routine_id (cascade: deleting a routine deletes its workouts, their exercises and sets, [ADR 0002](adr/0002-deleting-a-routine-deletes-its-workouts.md); workouts with no routine are never touched), started_at, finished_at, date, feeling, notes, in_progress, last_edited_at (last saved set change, for crash resume)
- **workout_exercises**: id, workout_id, exercise_id, position, target_weight_kg, target_reps, target_unit, progress_accepted, accepted_target_weight_kg, accepted_target_reps, accepted_target_unit, is_deload (the Target shown at the start and the lifter's unit when Start set it; whether the lifter accepted the offered step, and the stepped-up Target they accepted with the lifter's unit at Go up, which the next Start uses as is, snapped to the Jump's grid only when its unit differs from the current one; the accepted Target and its unit null after Stay and on rows saved before they were stored, which recompute the step; target_unit null on rows saved before migration 0007, which fall back to their sets' weight_unit, then kg; a null accepted_target_unit falls back to the Target's unit)
- **sets**: id, workout_exercise_id, exercise_id, idx, weight, weight_unit, reps, done, is_warmup, edited (`weight` is the number as typed or pre-filled and `weight_unit` the unit it is in, migration 0009, ADR 0003; a blank weight is 0 until typed; `edited`: the lifter typed this row, so it stops following earlier rows)
- **user_settings**: one row (id 1, created on first read) of the lifter's preferences. Today: `unit` (kg or lb, default kg), the Workout settings `default_rest_s` (seconds, default 90), `show_previous_set` (default true) and `keep_screen_awake` (default true), all three not-null (migration 0008), and the Jumps, one per equipment group: `jump_barbell_kg`, `jump_dumbbell_kg`, `jump_machine_kg`, `jump_cable_kg` and `jump_bodyweight_kg`. All five are nullable and stored in kg whichever unit set them (15 lb is 6.80388555). The effective Jump is the saved one converted to the current unit and snapped to the nearest rung of that unit's ladder, a tie rounding up (5 kg is 10 lb, and back in kg 5 kg); the engine steps by that rung's kg value. NULL means the lifter never changed that Jump: it is the current unit's default (kg 2.5 / 2 / 5 / 2.5 / 2.5, lb 5 / 5 / 10 / 5 / 5), so switching unit never writes a Jump. `default_rest_s` is clamped to 15 to 600 s (a multiple of 15) on read. Later features add theme, reminders and auto-backup as columns
- **settings**: key/value, internal flags only (the library seed version)
- **entitlements**: is_pro, product_id, proof, verified_at (a cache; `proof` is the store's signed transaction or purchase token, verified in Phase 3 so editing this table alone cannot unlock Pro)

Foreign keys are switched on after migrations finish (not before), because a migration that rebuilds a table would otherwise cascade-delete child rows.

Records (heaviest set, estimated 1RM, most volume) are queried from `sets`, never stored. Set weights are explained in [ADR 0003](adr/0003-sets-store-the-weight-as-typed.md), which supersedes [ADR 0001](adr/0001-weights-stored-in-kg.md) for sets.

## Units
- A set stores `weight` plus `weight_unit`, exactly as typed. Targets and Jumps are kg. All conversion is in `src/units` (1 lb = 0.45359237 kg) and happens in memory only.
- The live workout pre-fills rows from the Target as a number in the current unit (converted, not rounded again: the engine already put the Target on the Jump's grid). A row the lifter has neither typed nor checked follows a unit change by display only (`followUnit`): one saved in the other unit is converted and rounded to the Jump, and saved that way when checked or edited. Checked and typed rows keep their number and unit. The Last column rounds a past set to the Jump only when it was logged in the other unit.
- History shows a set in the current unit exactly (up to 0.01, trailing zeros dropped) and one in the other unit converted to one decimal with "≈" (`loggedWeightText`). Records, volume and charts compare and add in kg and show the result in the current unit to one decimal.
- Round targets to a multiple of the Jump: a step goes to the next multiple above, a drop or deload rounds down, and a Target set in the other unit snaps to the nearest (ties up). A Target set in the current unit never snaps because its Jump changed. Plates and bar weight are not part of the engine; the plate calculator (Pro) is a separate pure function.
- Switching kg ↔ lb any number of times must never change a stored value, including the open rows of a workout in progress. This is a Phase 2 gate.

## Overload engine
Plain functions: `nextTarget({rule, planned, loadType, history, jumpKg, unit}) → {target, proposal, reason}`. All weights are kg; `unit` is the lifter's current unit and each history session carries `targetUnit`, the unit its Target was set in (for a baseline, the unit its sets were logged in). When the two differ, the past Target (hold, on track, Stay, a baseline or an accepted stored Target) first snaps to the nearest multiple of `jumpKg` (`inCurrentUnit`; ties round up; a small tolerance leaves one already on the grid as is; bodyweight 0 stays 0), so 10 kg with a 5 lb Jump is 20 lb. A step up then goes one Jump above the snapped Target (62.5 kg in lb: Stay 140 lb, Go up 145 lb). A Target set in the current unit is never snapped, even after its Jump changed. A snapped Target differs from the stored one, so the Streak restarts.
- **Rule** (stored per exercise in a routine, with a version number): `step` (weight, reps or both), `repStep` (1–3), `sessionsToEarn` (default 3, 1–5), an optional miss rule (after N misses in a row at the same weight: keep, or drop X%) and an optional deload (every N weeks, X% lighter; off unless set).
- **Earned**: the Streak (clean workouts in a row at the same Target) reaches `sessionsToEarn`. The engine then returns a `proposal`; the lifter chooses whether to accept, and an accepted step becomes the Target of the following workout.
- **Outcomes** of a past workout: clean (every planned set at or above the Target; a set logged in another unit than its Target is compared with the Target snapped to the current unit's Jump grid, as the live workout showed it), hold (short of the Target but every set at or above the rep range minimum), miss (a set below the rep range minimum, or fewer sets than planned). Only the first planned working sets are judged.
- **Steps**: weight adds the Jump; reps adds the rep step, capped at the top of the range; both does both. Bodyweight exercises can only step by reps, and their Targets carry no weight: the engine reads any weight logged on them (before the bodyweight-or-weighted split) as 0.
- **Free rule**: the step comes from the exercise's `load_type` (weight for weighted, reps otherwise), three clean workouts in a row, no miss rule, no deload.

## Offline one-time purchase
- A non-consumable product on both stores, bought through react-native-iap.
- Acknowledge Google purchases right away (Google refunds them after 3 days if they aren't acknowledged).
- Cache the entitlement locally (`isPro`) so Pro works with no network; re-verify with the store opportunistically when online.
- Restore purchases from the paywall and from Welcome back. Handle refunds when the store reports them.

## Backup file
- A single `.increment` file holding JSON of every table plus a **format version number** from day one, so a v1.0 backup still imports into v1.5. Every set carries `weight` and `weight_unit` from the first version (ADR 0003), so no backup lacks per-set units.
- Pro-only to create. Restore is available on Welcome back during onboarding and in Settings.
- Automatic backups run on app open when one is due (after every workout, daily, weekly or monthly) and keep the last N files.

## Export
- CSV of all sets, and a PDF progress report via expo-print, shared through the share sheet. Pro only.
