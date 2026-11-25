# Architecture

## Principles
- **Offline-first, no backend.** All data lives in SQLite on the phone, and the app stores handle payment.
- **One source of truth per value.** A set stores its weight as typed with its unit, Targets are kg, a routine exercise's Jump is saved once per unit in that unit, and records are derived from sets rather than stored.
- **Pure logic is tested.** The overload engine and unit conversion are plain functions covered by unit tests.

## Stack
| Need | Choice |
|---|---|
| App framework | Expo (React Native) + TypeScript, Expo Router |
| Local database | SQLite (expo-sqlite) + Drizzle ORM, with migrations |
| App state | Zustand (first store: the rest timer, `src/workout/restStore.ts`, so it survives leaving the live screen) |
| UI | Own components on the Increment tokens, Sora font |
| Charts | Victory Native (Skia) |
| One-time purchase | expo-iap (StoreKit 2 / Google Play Billing; the Expo Modules sibling of react-native-iap, same API) |
| Reminders and rest-over alert | expo-notifications, local only (the rest timer uses it in Phase 1) |
| Rest timer extras | react-native-svg (progress ring), expo-haptics (buzz at zero) |
| Backup, export, PDF | expo-file-system, expo-sharing, expo-document-picker, expo-print |
| Builds and release | EAS Build, EAS Submit |
| Tests | Jest (logic), Maestro (flows) |

## Data model (first draft)
- **exercises**: id, slug, name, muscles, equipment, instructions, load_type (weighted, bodyweight), is_custom
- **routines**: id, name, days (bitmask), position
- **routine_exercises**: routine_id, exercise_id (cascade: deleting an exercise deletes its routine exercises, workout exercises and sets, [ADR 0005](adr/0005-deleting-a-custom-exercise-deletes-its-history.md), migration 0013; only custom exercises are ever deleted), position, sets, rep_min, rep_max, rest_s, rule (JSON), step_kg, step_lb (the Jump, "Add each time", one per unit and each in its own unit: `step_kg` in kg, `step_lb` in lb, never converted into each other; both nullable, added by migration 0010. NULL means the lifter never set that unit's step: it is the default, 2.5 kg or 5 lb for every exercise (`jumpIn` in `src/units`). The engine steps by the one for the current unit, so switching unit never writes either)
- **workouts**: id, routine_id (cascade: deleting a routine deletes its workouts, their exercises and sets, [ADR 0002](adr/0002-deleting-a-routine-deletes-its-workouts.md); workouts with no routine are never touched), started_at, finished_at, date, feeling, notes, in_progress, last_edited_at (last saved set change, for crash resume)
- **workout_exercises**: id, workout_id, exercise_id (cascade, as above), position, target_weight_kg, target_reps, target_unit, progress_accepted, accepted_target_weight_kg, accepted_target_reps, accepted_target_unit, is_deload (the Target shown at the start and the lifter's unit when Start set it; whether the lifter accepted the offered step, and the stepped-up Target they accepted with the lifter's unit at Go up, which the next Start uses as is, snapped to the Jump's grid only when its unit differs from the current one; the accepted Target and its unit null after Stay and on rows saved before they were stored, which recompute the step; target_unit null on rows saved before migration 0007, which fall back to their sets' weight_unit, then kg; a null accepted_target_unit falls back to the Target's unit)
- **sets**: id, workout_exercise_id, exercise_id (cascade, as above), idx, weight, weight_unit, reps, done, is_warmup, edited (`weight` is the number as typed or pre-filled and `weight_unit` the unit it is in, migration 0009, ADR 0003; a blank weight is 0 until typed; `edited`: the lifter typed this row, so it stops following earlier rows)
- **user_settings**: one row (id 1, created on first read) of the lifter's preferences. Today: `unit` (kg or lb, default kg), the Workout settings `default_rest_s` (seconds, default 90), `show_previous_set` (default true) and `keep_screen_awake` (default true), all three not-null (migration 0008). The per-equipment Jump columns (`jump_*_kg`) were dropped by migration 0010 without copying (the app was not released); the Jump now lives on `routine_exercises`. `default_rest_s` is clamped to 15 to 600 s (a multiple of 15) on read. Later features add theme, reminders and auto-backup as columns
- **settings**: key/value, internal flags only (the library seed version)
- **entitlements**: is_pro, product_id, proof, verified_at, unlock_screen_owed (boolean, default false; whether Pro unlocked is still owed after a switch during a live workout, migration 0012) (a cache of the store's last answer; `proof` is the store's signed transaction or purchase token. The store's on-device answer overwrites it at every check, so a hand edit holds only while the store can't answer; see [ADR 0004](adr/0004-the-store-decides-pro.md))

Foreign keys are switched on after migrations finish (not before), because a migration that rebuilds a table would otherwise cascade-delete child rows.

Records (heaviest set, estimated 1RM, most volume) are queried from `sets`, never stored. Set weights are explained in [ADR 0003](adr/0003-sets-store-the-weight-as-typed.md), which supersedes [ADR 0001](adr/0001-weights-stored-in-kg.md) for sets.

## Units
- A set stores `weight` plus `weight_unit`, exactly as typed. Targets are kg. A routine exercise's Jump is `step_kg` (kg) or `step_lb` (lb), defaulting to 2.5 kg / 5 lb; `jumpKgFor(jumps, unit)` gives the current unit's one as kg for the engine and the rounding. All conversion is in `src/units` (1 lb = 0.45359237 kg) and happens in memory only.
- The live workout pre-fills rows from the Target as a number in the current unit (converted, not rounded again: the engine already put the Target on the Jump's grid). A row the lifter has neither typed nor checked follows a unit change by display only (`followUnit`): one saved in the other unit is converted and rounded down to the Jump (62.5 kg shows as 135 lb), and saved that way when checked or edited. Checked and typed rows keep their number and unit. The Last column rounds a past set down to the Jump only when it was logged in the other unit.
- History shows a set in the current unit exactly (up to 0.01, trailing zeros dropped) and one in the other unit converted to one decimal with "≈" (`loggedWeightText`). Records, volume and charts compare and add in kg in memory. A Heaviest set shows as History shows a set; the estimated 1-rep max and volume show as whole numbers in the current unit (owner decision 2026-11-22).
- Round targets to a multiple of the Jump: a step goes to the next multiple above, a drop or deload rounds down, and a Target set in the other unit rounds down to the grid. The engine and `src/units` round down with one shared helper and tolerance (`floorToMultiple` in `src/grid`), so the Target banner and the rows never disagree. A Target set in the current unit never snaps because its Jump changed. Every caller (Start, the Today preview, the Offer, the summary, the live rows and the Last column) passes the routine exercise's Jump for the current unit; a workout whose routine exercise was deleted uses the default. Plates and bar weight are not part of the engine; the plate calculator (Pro) is a separate pure function.
- Switching kg ↔ lb any number of times must never change a stored value, including the open rows of a workout in progress. This is a Phase 2 gate.

## Overload engine
Plain functions: `nextTarget({rule, planned, loadType, history, jumpKg, unit}) → {target, proposal, reason}`. All weights are kg; `jumpKg` is the routine exercise's Jump for `unit` as kg (5 lb is 2.26796185 kg); `unit` is the lifter's current unit and each history session carries `targetUnit`, the unit its Target was set in (for a baseline, the unit its sets were logged in). When the two differ, the past Target (hold, on track, Stay, a baseline or an accepted stored Target) first rounds down to the largest multiple of `jumpKg` at or below it (`inCurrentUnit`; a small tolerance leaves one already on the grid as is; bodyweight 0 stays 0), so 62.5 kg with a 5 lb Jump is 135 lb. A step up then goes one Jump above the snapped Target (62.5 kg in lb: Stay 135 lb, Go up 140 lb). Judging a set logged in the current unit after a mid-workout switch rounds the Target down the same way. A Target set in the current unit is never snapped, even after its Jump changed. A snapped Target differs from the stored one, so the Streak restarts.
- **Rule** (stored per exercise in a routine, with a version number): `step` (weight, reps or both), `repStep` (1–3), `sessionsToEarn` (default 3, 1–5), an optional miss rule (after N misses in a row at the same weight: keep, or drop X%) and an optional deload (every N weeks, X% lighter; off unless set).
- **Earned**: the Streak (clean workouts in a row at the same Target) reaches `sessionsToEarn`. The engine then returns a `proposal`; the lifter chooses whether to accept, and an accepted step becomes the Target of the following workout.
- **Outcomes** of a past workout: clean (every planned set at or above the Target; a set logged in another unit than its Target is compared with the Target snapped to the current unit's Jump grid, as the live workout showed it), hold (short of the Target but every set at or above the rep range minimum), miss (a set below the rep range minimum, or fewer sets than planned). Only the first planned working sets are judged.
- **Steps**: weight adds the Jump; reps adds the rep step, capped at the top of the range; both does both. Bodyweight exercises can only step by reps, and their Targets carry no weight: the engine reads any weight logged on them (before the bodyweight-or-weighted split) as 0.
- **Default rule**: a new routine exercise starts with the step from its `load_type` (weight for weighted, reps otherwise), three clean workouts in a row, no miss rule, no deload. Every lifter can change the step, the miss rule (two misses in a row: drop 10%) and the deload (every 6 weeks, 40% lighter) in the Overload rule panel; Start marks a workout exercise `is_deload` when the engine returns a due Deload.

## Offline one-time purchase
- A non-consumable product on both stores, bought through expo-iap. The store's on-device answer decides Pro; the `entitlements` row is the fallback when the store can't answer ([ADR 0004](adr/0004-the-store-decides-pro.md)).
- The store adapter (`src/pro/`) is the only code that calls the store, and `src/pro/expoIapAdapter.ts` is the only file that imports expo-iap (an ESLint rule enforces it; Jest maps expo-iap to a stub). "What is owned" is `getAvailablePurchases` with active items only: StoreKit 2's current entitlements on iOS, which never prompts for an App Store sign-in, and Play's purchase query on Android. Every error and timeout is "no answer". Local iOS testing: [testing-purchases.md](testing-purchases.md).
- Acknowledge Google purchases right away (Google refunds them after 3 days if they aren't acknowledged): `finishTransaction` with `isConsumable: false`, after a purchase and on every check.
- Product `pro_lifetime` (one constant in `src/pro/product.ts`), the same ID on both stores. The adapter interface (`storeAdapter.ts`) is `connect`, `fetchProduct`, `buy`, `checkOwned` and `onPurchaseUpdate`; no call rejects, and every call except the payment sheet has a 10 s timeout. Pure parts are tested with a fake adapter: the entitlement decision (owned and purchased turns Pro on, a definite not owned turns it off, pending and no answer leave the row alone), `storeMapping`, `paywallState`, `unlockScreen` and `devSource`.
- **When the store is asked** (`src/pro/proChecks.ts`, started from the root layout's reminders effect): on a cold launch, on every return to the foreground, on every purchase update, after a purchase and after Restore purchase. Two checks never run at once. Screens never wait for it: `load()` reads the `entitlements` row before any screen renders, so Pro works offline from the cached row.
- One gate: `useIsPro()` from `@/pro`, which every later feature reads. A dev-only source (Store / Pro / Free) overrides it in memory and never writes the row.
- **unlock_screen_owed** (migration 0012, boolean, default false): set when Pro switches on from the store while the live workout, its Offer or its summary is open, and cleared once Pro unlocked has shown (or when Pro goes away). Pro unlocked shows after the workout is finished or discarded, or at a later launch that resumes no workout. The dev source never sets it.
- Restore purchases is the same check as at launch, from the Paywall's link (Welcome back arrives in Phase 4). Refunds land as a definite "not owned" at the next check.

## Backup file
- A single `.increment` file holding JSON of every table plus a **format version number** from day one, so a v1.0 backup still imports into v1.5. Every set carries `weight` and `weight_unit` from the first version (ADR 0003), so no backup lacks per-set units.
- Pro-only to create. Restore is available on Welcome back during onboarding and in Settings.
- Automatic backups run on app open when one is due (after every workout, daily, weekly or monthly) and keep the last N files.

## Export
- CSV of all sets, and a PDF progress report via expo-print, shared through the share sheet. Pro only.
