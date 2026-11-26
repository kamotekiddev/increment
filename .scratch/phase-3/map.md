# Phase 3 · Pro: map

Gate (from the roadmap): Pro unlocks offline on both stores, and a backup restores on a new phone. Checked by the owner after feature 8.

Phase 3 is split into eight features, the same way as Phases 1 and 2. Each feature ends with something usable on a phone, gets its own full spec at `.scratch/phase-3/<feature-slug>/spec.md` when it becomes next (not before), and is built on its own branch from `main`.

The roadmap's "rule panel" is not a feature here: it became free for everyone in Phase 2 (decisions.md, "Step per routine exercise"), so nothing is left to unlock.

## Features, in build order

| # | Feature | Needs first |
|---|---|---|
| 1 | Pro purchase and restore | Phase 2 |
| 2 | Routine limit upgrade | 1 |
| 3 | Custom exercises | 1 |
| 4 | Charts and All records (built, phone check pending) | 1 |
| 5 | ~~Plate calculator~~ (removed from Pro in PR #31) | 1 |
| 6 | Backup and restore (built, phone check pending) | 1 |
| 7 | Automatic backups (built, phone check pending) | 6 |
| 8 | Export and delete all data | 1 |

### 1 · Pro purchase and restore
The one-time Pro unlock with no subscription: the Paywall (9-row Free/Pro table, "Unlock Pro · [Price]", "One-time payment. No subscription. Works offline."), Pro unlocked, and Restore purchase on the paywall. The store's on-device answer decides Pro at launch, on return to the app, after a purchase and after Restore purchase. The answer is cached in `entitlements` (`isPro`), so Pro works with no network, and a refund or a hand edit is undone at the next check ([ADR 0004](../../docs/adr/0004-the-store-decides-pro.md)). The feature also adds an Increment Pro card in Settings (the Paywall's entry point and Restore purchase's home after onboarding), a pending-payment state, and a dev-only Pro source switch. Spec: `.scratch/phase-3/pro-purchase/spec.md`. Adds one `isPro` gate every later feature reads (Pro limits in one place, product rule). The Welcome back restore is Phase 4 onboarding; only the restore function lands here. Gate half one: Pro unlocks offline on both stores.

### 2 · Routine limit upgrade (built, phone check pending)
The "2 free routines used" pop-up gets its See Pro button linking to the Paywall (it has none in Phase 1). Spec: `.scratch/phase-3/routine-limit-upgrade/spec.md`. Pro lifts the limit of 2 routines to unlimited, and the Routines counter changes accordingly. It also builds the **Locked routine** (see `GLOSSARY.md`; owner decision 2026-11-24):
- Without Pro, for example after a refund, routines past the 2 oldest (by creation) lock.
- A Locked routine stays on the Routines tab with a lock and a Pro tag.
- It opens read-only with a banner and **Unlock Pro**, and it can be deleted but not started or edited.
- It is left out of Today and Reminders, and its history and records stay.
- A Workout in progress on it may be finished first.
- Deleting an older routine unlocks the next one, and buying or restoring Pro unlocks them all.

### 3 · Custom exercises (built, phone check pending; grilled 2026-11-25, spec: `.scratch/phase-3/custom-exercises/spec.md`)
Create, edit and delete a custom exercise (Pro). Delete removes it from routines and deletes its history ([ADR 0005](../../docs/adr/0005-deleting-a-custom-exercise-deletes-its-history.md)). The "No search results" state gets its create shortcut. A free lifter can open the form, but Unlock Pro replaces Save and opens the Paywall.

### 4 · Charts and All records (built, phone check pending; grilled 2026-11-25, spec: `.scratch/phase-3/charts-and-all-records/spec.md`)
The Progress tab's blurred chart preview becomes the real chart for Pro (weight, estimated 1-rep max and volume over time, per exercise; reps for a bodyweight exercise), and the All records screen opens from the Records card. Free users keep the locked preview, top set, pills and Records card as in Phase 2, and tapping the preview or "See all records" opens the Paywall.

### 5 · Plate calculator (removed from Pro in PR #31, not built)
A plate calculator button on the live workout opens a calculator (Pro) that shows the plates per side for the set's weight, plus "Your gym's plates" (moved here from Phase 2 feature 2). A separate function from the engine and `src/units`: it never changes a Target or a Jump. Open for its spec: a free lifter opening the Paywall from the calculator is on top of the live workout, so buying there would show Pro unlocked over the workout. Feature 1's "never over a live workout" rule doesn't see a Paywall opened from the workout, so this spec decides what happens.

### 6 · Backup and restore (grilled 2026-11-26, spec: `.scratch/phase-3/backup-and-restore/spec.md`)
The Your data section in Settings: free state shows the backup row locked, opening the Paywall. Pro creates a single `.increment` file (JSON of every table plus a format version number from day one, every set with `weight` and `weight_unit`), handed to the share sheet (Backup ready). Restore from a file on Your data (free for everyone). Second half of the gate: a backup restores on a new phone.

### 7 · Automatic backups (built, phone check pending; grilled 2026-11-26, spec: `.scratch/phase-3/automatic-backups/spec.md`)
Automatic backups (Pro): frequency (after every workout, daily, weekly or monthly), location and number of files kept, checked when the app opens. On iOS to the app's own folder (Files › On My iPhone › Increment, no iCloud Drive); on Android to a folder the lifter picks.

### 8 · Export and delete all data
Export progress to CSV (all sets) or a PDF progress report via expo-print, through the share sheet (Pro). Delete all data with a typed confirmation, free for everyone; it leaves the Pro entitlement alone.

## Decisions so far
- Split by what the lifter can use on the device, not by screen.
- Feature 1 comes first because every other feature reads the Pro gate. Features 2 to 6 and 8 depend only on it, so they can move earlier or later if the owner wants; 7 needs 6.
- Pro price: ₱300 for now, the peso base price on both stores (decisions.md, 2026-11-24).
- Feature 1 grilled 2026-11-24. The store decides Pro and the table is the fallback (ADR 0004). The library is expo-iap. The product is `pro_lifetime` on both stores. After a refund, everything the lifter made stays, and only Pro actions and routines past the 2 oldest lock. Restore purchase is reached from an Increment Pro card at the top of Settings, so that open item is closed. The Locked routine moves to feature 2.

## Open
- Plate calculator "and warm-ups" (product.md Pro table): warm-ups are not in the roadmap's Phase 3 list. Decide whether they join feature 5, wait for Phase 4, or are dropped.
- Whether Delete all data resets the Pro entitlement (proposed: no, it only clears training data).
