# 02: Install expo-iap and make the first builds

**What to build:** The native side, with no purchase logic yet. Play Console won't let you create an in-app product until a build that carries the billing library has been uploaded, so this ticket comes before the store setup.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent (the upload is ready-for-human)

- [x] Read the expo-iap docs for the installed version first. Run `npx expo install expo-iap`, add its config plugin to `app.json` (plus `expo-build-properties` if the docs still need it), and check that `npx expo-doctor` passes on SDK 58.
- [ ] Set `ios.bundleIdentifier` and `android.package` in `app.json` (owner picks the values).
- [ ] A development build for each platform (`bunx`/`npx eas-cli build --profile development`, or `npx expo run:ios|android`).
- [ ] **Owner:** upload an Android build to the Play Console internal testing track, so ticket 03 can create the product.
- [x] Type check, lint and tests pass.

## Comments

**2026-11-24, agent (install part done, owner part open):**

- `npx expo install expo-iap` installed **expo-iap 6.5.1** (`^6.5.1`; it isn't in Expo's bundled list, so there's no SDK pin). It added `"expo-iap"` to `app.json` plugins with no options. `npx expo config --type prebuild` loads the plugin cleanly ("Using the published OpenIAP packages"; OpenIAP apple/google 4.2.1).
- **No `expo-build-properties`.** The expo-iap docs (openiap.dev/docs/setup/expo) validate SDK 57 / RN 0.86 and set Kotlin 2.1.20 and iOS 16.4 there, but say the default toolchain is enough. On SDK 58, RN 0.88 already ships Kotlin 2.2.0, compileSdk 37 and minSdk 24, above expo-iap's minimums (compileSdk 36, minSdk 23). Its podspec says apps need iOS 15.0 for the OpenIAP Swift package, and RN 0.88's minimum is 15.1. SDK 58 is not yet listed as validated in the expo-iap docs, so a native build is the real test.
- **expo-doctor:** 20/20 passed. Before that, one check failed because of SDK 58 version drift that was already on main (expo, @expo/ui, expo-router, expo-sqlite, jest-expo patches, expo-web-browser 58.0 → 58.1). It is fixed with `npx expo install --fix` in its own commit. That also added `"expo-web-browser"` to plugins, which does nothing without options.
- **Left for the owner:** set `ios.bundleIdentifier` and `android.package`. Then make a development build for each platform (no `ios/`/`android/` were generated here), upload an Android build to Play Console internal testing, and turn on the In-App Purchase capability on the App ID (EAS syncs capabilities; the docs mention Xcode's Signing & Capabilities for local builds). The plugin adds no BILLING permission itself; Play Billing's manifest brings it in.
