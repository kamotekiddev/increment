# 04: Theme and Expo UI spike

**What to build:** The app shows its own look: the accent purple, the warm off-white background and the Sora font. One purple pill button and one line of Sora text, built on Expo UI, appear on screen on both an iPhone and an Android phone, so we know whether Expo UI can match the design before everything else is built on it.

**Blocked by:** None (can start immediately).

**Status:** ready-for-agent

- [ ] A typed token module holds the light-theme colours, spacing and type from the design system, with room for a dark set later
- [ ] Sora loads at runtime and the splash screen stays up until fonts are ready
- [ ] A pill-shaped accent button and a Sora text built on Expo UI show on the screen
- [ ] The owner confirms on both phones that they match the design, in light and dark system mode
- [ ] Any Expo UI component that cannot match the design is wrapped in our own component and reported to the owner
- [ ] Type check, lint and Jest all pass
