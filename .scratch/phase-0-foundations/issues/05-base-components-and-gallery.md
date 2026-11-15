# 05: Base components and dev gallery

**What to build:** The building blocks every later screen uses (text, button in primary and secondary pill styles, card, pill including the accent-tint variant, input and bottom sheet) exist and look like the design system. A hidden developer-only screen shows them all together so they can be checked on a phone.

**Blocked by:** 04

**Status:** built; bottom sheet not yet tapped on a device

- [x] Each component takes its colours, sizes and fonts from the tokens and has no hard-coded values
- [x] Touch targets are at least 44 pt
- [x] The gallery route is reachable only in development
- [ ] The owner checks every component in the gallery on both phones
- [x] Type check, lint and Jest all pass

## Notes
- Text and Button are plain React Native (see ticket 04). The bottom sheet wraps the `@expo/ui` one and still needs a tap test on a device.
- Gallery checked on the iPhone simulator.
