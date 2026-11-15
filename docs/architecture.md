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
| App state | Zustand |
| UI | Own components on the Increment tokens, Sora font |
| Charts | Victory Native (Skia) |
| One-time purchase | react-native-iap (StoreKit 2 / Google Play Billing) |
| Reminders | expo-notifications, local only |
| Backup, export, PDF | expo-file-system, expo-sharing, expo-document-picker, expo-print |
| Builds and release | EAS Build, EAS Submit |
| Tests | Jest (logic), Maestro (flows) |

## Data model (first draft)
- **exercises**: id, name, muscles, equipment, instructions, is_custom
- **routines**: id, name, days (bitmask), position
- **routine_exercises**: routine_id, exercise_id, position, sets, rep_min, rep_max, rest_s, rule (JSON)
- **workouts**: id, routine_id, started_at, finished_at, feeling, notes, in_progress
- **sets**: id, workout_id, exercise_id, index, weight_kg, entered_unit, reps, done, is_warmup
- **settings**: key/value (unit, jumps per equipment, plates, rest default, theme, reminders, auto-backup)
- **entitlements**: is_pro, product_id, verified_at (cached locally)

Records (heaviest set, estimated 1RM, most volume) are queried from `sets`, never stored.

## Units
- Store `weight_kg` plus `entered_unit`. Convert only for display.
- Round displayed targets to loadable weights using the equipment's smallest jump and the plates the user has.
- Switching kg ↔ lb any number of times must never change a stored value. This is a Phase 2 gate.

## Overload engine
Plain functions: `(rule, history) → next target`. Rule types:
- **Weight first**: add the jump once every set hits the top of the rep range (the free rule).
- **Double progression**: add reps across the range, then add weight and reset the reps.
- **Reps only**: for bodyweight exercises and fixed weights.
- Plus miss handling (keep the weight, or drop a percentage after N misses) and deload weeks.

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
