# 06: Placeholder tabs with the floating tab bar

**What to build:** The app opens to a floating white pill tab bar with four tabs: Today, Routines, Library and Progress. The active tab is an accent pill. Each tab shows an empty placeholder screen.

**Blocked by:** 04

**Status:** built; iPhone simulator checked, Android not yet

- [x] The four tabs exist and switching between them works on both phones
- [x] The active tab is shown as an accent pill and inactive icons use the faint icon colour
- [x] The tab bar floats over content and respects the safe area
- [x] Routes live in the app routes folder only; no logic lives there
- [x] Type check, lint and Jest all pass

## Notes
- The tab bar floats over the screen content. Screens with scrollable lists (Phase 1 Library, Routines) must reserve bottom space for it, or the last rows sit under the bar.
