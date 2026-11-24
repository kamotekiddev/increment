# 07: Increment Pro card and Developer card in Settings

**What to build:** The Paywall's entry point for feature 1, and the dev-only Pro source switch.

**Blocked by:** 06

**Status:** ready-for-agent

- [ ] `ProCard` in `src/settings/`, first in `src/app/settings.tsx`, above `UnitCard`, as drawn on the canvas's `Settings` frame.
  - Free: "Increment Pro" with "Unlock ›", which opens the Paywall.
  - Pro: "Increment Pro" with "Unlocked ✓", not tappable.
  - Design tokens only.
- [ ] `DeveloperCard`, last in Settings, rendered only when `__DEV__`. It has a segmented control "Pro source: Store / Pro / Free" bound to the Pro store's dev `source`. It resets to Store on launch and writes nothing.
- [ ] Switching to Pro with the Paywall closed shows Pro unlocked like any switch to Pro. Switching to Free makes every Pro check read false.
- [ ] Type check, lint and tests pass.
