# 08: Deck preview card

**What to build:** Under the Today deck (below the dots row) show a "Today: <Routine>" header with "N exercises" muted on the right, and a card with the first 3 exercises of the Routine on top of the deck, each with its Target, and "+ N more" or "No exercises yet". It uses the same card as the rest-day Next card and follows the deck when swiped. A Done Routine still shows it (read-only). No extra Start button; rest day, no-days and no-routines states unchanged. Decided 2026-11-17.

**Blocked by:** 07

**Status:** built

- [x] Shared `ExercisePreviewCard`, `RoutineDeck` `onTopChange`, preview follows the top card; header text helpers tested; design tokens only
- [x] Type check, lint and tests pass
- [ ] Looks right on a device and follows the swipe (added to ticket 04)
