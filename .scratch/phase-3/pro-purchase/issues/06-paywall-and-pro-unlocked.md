# 06: Paywall and Pro unlocked

**What to build:** The two screens from the canvas (`Paywall`, `PaywallStates`, `ProUnlocked`), the purchase flow, and the "show Pro unlocked once" rule.

**Blocked by:** 05

**Status:** built

- [x] A pure Paywall state function: the product fetch (loading / loaded with a price string / failed), pending and in flight give the button label, enabled flag, spinner and line under it. The states are in the spec. Jest covers each state and the precedence (in flight > pending > loaded).
- [x] `src/app/paywall.tsx`, presented modally, with the component in `src/pro/`:
  - "Restore purchase" (wired in ticket 07), a close button, title and subtitle;
  - the 9-row Free/Pro table;
  - the button and the line under it.

  It fetches the product on open and on return to the foreground. Design tokens only.
- [x] Tapping Unlock Pro opens the store's sheet. A user cancel returns quietly. Any other error shows the alert "Purchase didn't go through" / "You weren't charged. Try again in a moment."
- [x] `src/app/pro-unlocked.tsx`, presented modally: the hero, title, line, the four included rows, and **Start using Pro**. There is no backup card (feature 7 adds it).
- [x] When the Pro store reports a switch to Pro, Pro unlocked replaces the Paywall if it is open, and otherwise the root pushes it. Start using Pro dismisses both and returns to the screen underneath. Check the SDK 58 Expo Router docs for modals and dismissing several screens.
- [x] Never over a live workout:
  - Migration 0012 adds `entitlements.unlock_screen_owed` (boolean, not null, default false) through Drizzle.
  - A pure "when to show" function covers the five cases in the spec, with Jest.
  - While the live workout screen is open, a switch to Pro sets the flag instead of showing. Finishing (after the summary) or discarding shows Pro unlocked and clears the flag.
  - A launch with the flag set and no workout to resume shows it.
  - The migrations test covers 0012.
- [x] Type check, lint and tests pass.

## Comments

**2026-11-24, agent:**

- **Routes:** `/paywall` (`src/app/paywall.tsx` → `src/pro/PaywallScreen.tsx`) and `/pro-unlocked` (`src/app/pro-unlocked.tsx` → `src/pro/ProUnlockedScreen.tsx`), both declared in the root `Stack` with `presentation: "modal"`. Pure parts: `paywallState.ts` (in flight > pending > product; in flight keeps the price label and shows a spinner), `unlockScreen.ts` (when Pro unlocked shows), `proRoutes.ts`. Restore purchase is drawn but does nothing yet (ticket 07). No Settings card (ticket 08).
- **Buying:** after `buy` says purchased or pending, the Paywall calls `refresh()`; the switch to Pro then opens Pro unlocked. iOS Ask to Buy never shows up as pending in `checkOwned` (ticket 04), so on iOS the Paywall keeps its own "bought pending" flag for as long as it is open; on Android the store's `pending` drives it, so a cancelled payment returns the button to normal.
- **Showing Pro unlocked:** `useProUnlockedScreen` in the root layout listens to `onSwitchedOn`. If the focused path is `/paywall`, it calls `router.replace("/pro-unlocked")`; otherwise it pushes. **Start using Pro** counts the Paywall / Pro unlocked routes on top of the root stack (`proScreensOnTop`) and calls `router.dismiss(count)` (SDK 58: "navigates to a stack lower than the current screen using the provided count"), so it returns to the screen underneath, whether Pro unlocked replaced the Paywall or sits on it.
- **"Live workout open"** comes from the router's focused path, as `reminderTapRoutesToToday` already does: `/workout/<id>`, `/workout/offer/<id>` and `/workout/summary/<id>` (`inWorkoutFlow`) count as open, so an owed screen waits until after the summary. Leaving those screens with the flag owed shows Pro unlocked only when no workout is still in progress (`findInProgressWorkout`), so Minimize keeps it owed and Finish or Discard shows it. The launch check (`useProUnlockedOnLaunch`, next to `useResumeOnLaunch` in `(tabs)/_layout.tsx`) uses the same 12-hour test as crash resume. A switch before the navigator is drawn is owed and paid by that launch check.
- **Migration 0012** (`drizzle/0012_pro_unlock_screen_owed.sql`, from `drizzle-kit generate`) adds only the column. `writeEntitlement` never touches the flag.
- **Tokens added:** `accentTintLine` and the `pro` sizes (table columns, hero rings, item checks), recorded in `docs/design-system.md`.
- **For later features:** the check reads the focused path, so a Paywall opened on top of the live workout (for example from the plate calculator, feature 8) counts as "not in a workout", and buying there would show Pro unlocked over it. That feature should decide what happens. A workout discarded outside the workout screens (none today) would leave the flag owed until the next workout ends or the next launch.
- **Not checked on a phone:** the layouts and the modal flow were not run on a device here. They are part of the owner's check in ticket 09.
