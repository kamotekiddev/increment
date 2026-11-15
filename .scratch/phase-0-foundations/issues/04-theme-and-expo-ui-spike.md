# 04: Theme and Expo UI spike

**What to build:** The app shows its own look: the accent purple, the warm off-white background and the Sora font. One purple pill button and one line of Sora text, built on Expo UI, appear on screen on both an iPhone and an Android phone, so we know whether Expo UI can match the design before everything else is built on it.

**Blocked by:** None (can start immediately).

**Status:** spike run on the iPhone simulator; Android not yet checked

- [x] A typed token module holds the light-theme colours, spacing and type from the design system, with room for a dark set later
- [x] Sora loads at runtime and the splash screen stays up until fonts are ready
- [x] A pill-shaped accent button and a Sora text built on Expo UI show on the screen
- [ ] The owner confirms on both phones that they match the design, in light and dark system mode
- [ ] Any Expo UI component that cannot match the design is wrapped in our own component and reported to the owner
- [x] Type check, lint and Jest all pass

## Spike result (iPhone simulator, iOS 18.3)

- Sora loads at runtime (confirmed).
- `@expo/ui` Text ignores `fontFamily` and `fontWeight` on iOS, so it shows the system font. Plain React Native Text shows Sora correctly.
- `@expo/ui` filled Button draws the system blue box around its label. The `text` variant removes the box, but the label is still the system font.
- A plain React Native Pressable pill matches the design.
- Decision: Text and Button are our own React Native components on the tokens. `@expo/ui` is kept for the bottom sheet, switch and picker. Android is still to be checked.
