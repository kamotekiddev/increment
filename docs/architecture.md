# Architecture

## Principles
- **Offline-first, no backend.** All data lives in SQLite on the phone, and the app stores handle payment.
- **One source of truth per value.** Weights are stored in kg, and records are derived from sets rather than stored.
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
- **exercises**: id, slug, name, muscles, equipment, instructions, load_type (weighted, bodyweight, bodyweight_or_weighted), is_custom
- **routines**: id, name, days (bitmask), position
- **routine_exercises**: routine_id, exercise_id, position, sets, rep_min, rep_max, rest_s, rule (JSON)
- **workouts**: id, routine_id (cascade: deleting a routine deletes its workouts, their exercises and sets, [ADR 0002](adr/0002-deleting-a-routine-deletes-its-workouts.md); workouts with no routine are never touched), started_at, finished_at, date, feeling, notes, in_progress, last_edited_at (last saved set change, for crash resume), rest_ends_at, rest_total_ms, rest_exercise_index, rest_set_index (the running rest timer, null when none)
- **workout_exercises**: id, workout_id, exercise_id, position, target_weight_kg, target_reps, progress_accepted, is_deload (the Target shown at the start, and whether the lifter accepted the offered step)
- **sets**: id, workout_exercise_id, exercise_id, idx, weight_kg, entered_unit, reps, done, is_warmup, edited (the lifter typed this row, so it stops following earlier rows)
- **settings**: key/value (unit, jump per equipment, rest default, theme, reminders, auto-backup)
- **entitlements**: is_pro, product_id, proof, verified_at (a cache; `proof` is the store's signed transaction or purchase token, verified in Phase 3 so editing this table alone cannot unlock Pro)

Foreign keys are switched on after migrations finish (not before), because a migration that rebuilds a table would otherwise cascade-delete child rows.

Records (heaviest set, estimated 1RM, most volume) are queried from `sets`, never stored. Weights are explained in [ADR 0001](adr/0001-weights-stored-in-kg.md).

## Units
- Store `weight_kg` plus `entered_unit`. Convert only for display.
- Round targets to a multiple of the Jump. Plates and bar weight are not part of the engine; the plate calculator (Pro) is a separate pure function.
- Switching kg ↔ lb any number of times must never change a stored value. This is a Phase 2 gate.

## Overload engine
Plain functions: `nextTarget({rule, planned, loadType, history, jumpKg}) → {target, proposal, reason}`. All weights are kg.
- **Rule** (stored per exercise in a routine, with a version number): `step` (weight, reps or both), `repStep` (1–3), `sessionsToEarn` (default 3, 1–5), an optional miss rule (after N misses in a row at the same weight: keep, or drop X%) and an optional deload (every N weeks, X% lighter; off unless set).
- **Earned**: the Streak (clean workouts in a row at the same Target) reaches `sessionsToEarn`. The engine then returns a `proposal`; the lifter chooses whether to accept, and an accepted step becomes the Target of the following workout.
- **Outcomes** of a past workout: clean (every planned set at or above the Target), hold (short of the Target but every set at or above the rep range minimum), miss (a set below the rep range minimum, or fewer sets than planned). Only the first planned working sets are judged.
- **Steps**: weight adds the Jump; reps adds the rep step, capped at the top of the range; both does both. Bodyweight exercises can only step by reps.
- **Free rule**: the step comes from the exercise's `load_type` (weight for weighted, reps otherwise), three clean workouts in a row, no miss rule, no deload.

## Offline one-time purchase
- A non-consumable product on both stores, bought through react-native-iap.
- Acknowledge Google purchases right away (Google refunds them after 3 days if they aren't acknowledged).
- Cache the entitlement locally (`isPro`) so Pro works with no network; re-verify with the store opportunistically when online.
- Restore purchases from the paywall and from Welcome back. Handle refunds when the store reports them.

## Backup file
- A single `.increment` file holding JSON of every table plus a **format version number** from day one, so a v1.0 backup still imports into v1.5.
- Pro-only to create. Restore is available on Welcome back during onboarding and in Settings.
- Automatic backups run on app open when one is due (after every workout, daily, weekly or monthly) and keep the last N files.

## Export
- CSV of all sets, and a PDF progress report via expo-print, shared through the share sheet. Pro only.
