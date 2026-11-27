# 01: Onboarding module, `onboarded` flag and hard-coded Quick start plan

**What to build:** The onboarding module and the `onboarded` flag, with no screens. A new `onboarded` column on `user_settings` (Drizzle migration) is set by the migration for every existing install (a settings row, any routine or any workout). The module offers `isOnboarded`, `finishOnboarding` (flag only), `finishQuickStart(unit)` (in one all-or-nothing transaction: the hard-coded Quick start plan, the unit and the flag) and the pure routing function (welcome or tabs). The plan is Full body A on Mon and Fri, Full body B on Wed, 4 library exercises each, 3 sets, Rep range 10 to 15, 60 s rest, in one clearly marked constant that feature 3 replaces. Restore from a backup and Delete all data keep `onboarded` as it is. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] A fresh database reads not onboarded; a database migrated from before this feature reads onboarded when it has a settings row, a routine or a workout (migration test), and an empty old one does not.
- [x] `finishQuickStart("kg")` creates exactly the 2 routines with the right days, exercises, sets, Rep range and rest, saves the unit (`"lb"` too) and sets the flag; the plan fits the free routine limit.
- [x] `finishQuickStart` is all-or-nothing: a failure part way leaves no routine, no unit change and no flag.
- [x] `finishOnboarding` writes only the flag; nothing is written before a finish call.
- [x] `restoreBackup` and Delete all data leave `onboarded` true.
- [x] The routing function returns welcome when not onboarded, tabs when onboarded.
- [x] The Quick start plan constant is marked as replaced by the generator in feature 3.
- [x] `npx tsc --noEmit`, `npx expo lint` and the Jest suite pass.

## Comments
