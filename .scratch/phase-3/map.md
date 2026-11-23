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
| 4 | Charts and All records | 1 |
| 5 | Plate calculator | 1 |
| 6 | Backup and restore | 1 |
| 7 | Automatic backups | 6 |
| 8 | Export and delete all data | 1 |

### 1 · Pro purchase and restore
The one-time Pro unlock with no subscription: the Paywall (9-row Free/Pro table, "Unlock Pro · [Price]", "One-time payment. No subscription. Works offline."), Pro unlocked, and Restore purchase on the paywall. The purchase is verified against the store's signed transaction or purchase token and cached in `entitlements` (`isPro`), so Pro works with no network and editing the table alone cannot unlock it; it is re-verified when online and refunds are handled. Adds one `isPro` gate every later feature reads (Pro limits in one place, product rule). The Welcome back restore is Phase 4 onboarding; only the restore function lands here. Gate half one: Pro unlocks offline on both stores.

### 2 · Routine limit upgrade
The "2 free routines used" pop-up gets its Unlock Pro button linking to the Paywall (it has none in Phase 1). Pro lifts the limit of 2 routines to unlimited, and the Routines counter changes accordingly.

### 3 · Custom exercises
Create, edit and delete a custom exercise (Pro). Delete removes it from routines and keeps history. The "No search results" state gets its create shortcut. A free lifter sees the entry points locked, opening the Paywall.

### 4 · Charts and All records
The Progress tab's blurred chart preview becomes the real chart for Pro (weight, estimated 1-rep max and volume over time, per exercise), and the All records screen opens from the Records card. Free users keep the locked preview, top set, pills and Records card as in Phase 2.

### 5 · Plate calculator
A plate calculator button on the live workout opens a calculator (Pro) that shows the plates per side for the set's weight, plus "Your gym's plates" (moved here from Phase 2 feature 2). A separate function from the engine and `src/units`: it never changes a Target or a Jump.

### 6 · Backup and restore
The Your data section in Settings: free state shows the backup row locked, opening the Paywall. Pro creates a single `.increment` file (JSON of every table plus a format version number from day one, every set with `weight` and `weight_unit`), handed to the share sheet (Backup ready). Restore from a file in Settings. Second half of the gate: a backup restores on a new phone.

### 7 · Automatic backups
Automatic backups (Pro): frequency (after every workout, daily, weekly or monthly), location and number of files kept, checked when the app opens. On iOS to the app's folder or iCloud Drive; on Android to a folder the lifter picks.

### 8 · Export and delete all data
Export progress to CSV (all sets) or a PDF progress report via expo-print, through the share sheet (Pro). Delete all data with a typed confirmation, free for everyone; it leaves the Pro entitlement alone.

## Decisions so far
- Split by what the lifter can use on the device, not by screen.
- Feature 1 comes first because every other feature reads the Pro gate. Features 2 to 6 and 8 depend only on it, so they can move earlier or later if the owner wants; 7 needs 6.
- Pro price and currency for each store are still open in decisions.md and must be settled before feature 1 ships.

## Open
- Plate calculator "and warm-ups" (product.md Pro table): warm-ups are not in the roadmap's Phase 3 list. Decide whether they join feature 5, wait for Phase 4, or are dropped.
- Whether Delete all data resets the Pro entitlement (proposed: no, it only clears training data).
- Where a lifter who bought Pro finds Restore purchase after onboarding, besides the paywall (Welcome back is Phase 4).
