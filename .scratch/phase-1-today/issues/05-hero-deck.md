# 05: Hero deck

**What to build:** Replace the compact Today cards with the swipeable accent-hero deck the owner approved in a prototype (decision 2026-11-17: the compact card was too compact). Each planned Routine is a hero card (caption, name, "N exercises", white Start workout pill); Done and In progress are white cards with no button. Cards form a deck with a tilt on drag, the next card rising and filling in, fly-off to the back past 70 pt or a flick, dots and "1 of 2 · swipe" with two or more cards, and a plain card for one. Deck order: still-to-do Routines first, then Done. `buildToday` and its tests gain this order and `exerciseCount` on each card.

**Blocked by:** 03

**Status:** built

- [x] `buildToday` orders cards still-to-do first, then Done, and carries `exerciseCount`; `toTodayInput` passes it through (Jest)
- [x] Hero card, deck and states use design tokens only (new tokens `accentLayer1`, `accentLayer2`, `deck`, `opacity.onAccentSoft`); no eslint-disable
- [x] Accessible alternative: "Next routine" action on the deck and the dots row, Start has label `Start <name>`; reduced motion shortens the fly-off
- [x] Type check, lint and tests pass
- [ ] Swipe, tilt, reveal and swap run smoothly on a device with no text flash (not run on a device yet; see ticket 04)
- [ ] Tap on Start works on the top card and a vertical scroll over the deck still scrolls the page (device)
