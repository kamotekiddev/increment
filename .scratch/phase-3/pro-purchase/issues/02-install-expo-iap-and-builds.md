# 02: Install expo-iap and make the first builds

**What to build:** The native side, with no purchase logic yet. Play Console won't let you create an in-app product until a build that carries the billing library has been uploaded, so this ticket comes before the store setup.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent (the upload is ready-for-human)

- [ ] Read the expo-iap docs for the installed version first. Run `npx expo install expo-iap`, add its config plugin to `app.json` (plus `expo-build-properties` if the docs still need it), and check that `npx expo-doctor` passes on SDK 58.
- [ ] Set `ios.bundleIdentifier` and `android.package` in `app.json` (owner picks the values).
- [ ] A development build for each platform (`bunx`/`npx eas-cli build --profile development`, or `npx expo run:ios|android`).
- [ ] **Owner:** upload an Android build to the Play Console internal testing track, so ticket 03 can create the product.
- [ ] Type check, lint and tests pass.
