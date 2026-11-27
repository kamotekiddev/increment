# 02: Welcome gate and "I already have Increment"

**What to build:** A fresh install shows Welcome once (`OnbWelcome` on the canvas): "Lift a little more every week", one line of body, **Get started** and **I already have Increment**, in light and dark. It sits outside the tabs, so there is no tab bar or in-progress bar and no way back into an empty app (Android back leaves the app). The root layout reads `isOnboarded` with the other startup reads and routes with the routing function; an updated install goes straight to Today. "I already have Increment" opens the existing Restore from a backup flow; a successful restore calls `finishOnboarding` and opens Today, and backing out returns to Welcome with nothing saved. "Get started" is a placeholder until ticket 03. Docs for the gate go in this change (`docs/architecture.md`, `docs/screens.md` Welcome row, `docs/decisions.md` for the `onboarded` rules). See `../spec.md`.

**Blocked by:** 01

**Status:** resolved

- [ ] A fresh install opens on Welcome; after `finishOnboarding` it never shows again, including after a kill and relaunch.
- [ ] An install that already has data opens on Today with no Welcome.
- [ ] "I already have Increment" restores a backup and lands on Today; cancelling the picker or the preview returns to Welcome and writes nothing.
- [ ] Welcome has no tab bar or in-progress bar, and Android back does not reach the tabs.
- [ ] Welcome matches `OnbWelcome` in light and dark, with design tokens only.
- [x] Docs updated in the same change.
- [x] `npx tsc --noEmit`, `npx expo lint` and the Jest suite pass.

## Comments

- Boxes 1 to 5 are wired but need a phone to verify (fresh install, update install, restore flow, Android back, light and dark look); left unticked.
