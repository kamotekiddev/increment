# Testing purchases on iOS without App Store Connect

`storekit/Increment.storekit` is a local StoreKit configuration file. It sells one non-consumable, `pro_lifetime` ("Increment Pro"), at ₱300 in the Philippines storefront (PHL). With it switched on, StoreKit in the iOS Simulator answers from this file instead of the App Store. You can buy Pro, restore it and refund it before the Apple Developer account or the App Store Connect product exists.

It lives outside `ios/` because `ios/` is generated (Continuous Native Generation) and git-ignored.

## Set it up

1. Build and install a development build once: `npx expo run:ios`. This generates `ios/` and starts Metro. expo-iap is native code, so Expo Go can't run it. While `ios.bundleIdentifier` isn't set in `app.json`, the command asks for one.
2. Open `ios/Increment.xcworkspace` in Xcode. Use the workspace, not the `.xcodeproj`.
3. Choose **Product → Scheme → Edit Scheme…** (or click the scheme name in the toolbar and choose Edit Scheme).
4. Select the **Run** action, then the **Options** tab.
5. Under **StoreKit Configuration**, choose `Increment.storekit`. If it isn't listed, pick the add option in that menu and select `storekit/Increment.storekit` at the repo root. Click **Close**.
6. With Metro still running, run the app from Xcode (**Product → Run**, ⌘R) on a Simulator.

Apple's docs describe the setting as part of the scheme's Run action, so it applies when Xcode runs the app. `npx expo run:ios` builds and launches without Xcode's Run action, so run from Xcode whenever you test purchases.

**Redo steps 2 to 5 after a clean prebuild.** The setting is saved in the generated Xcode scheme, so `npx expo prebuild --clean`, or deleting `ios/`, removes it.

To switch it off, set **StoreKit Configuration** back to **None** in the same place.

## While testing

- **The payment sheet** shows the ₱300 price in pesos. The price is a placeholder from this file, not the real App Store price (which is set in App Store Connect, ticket 03).
- **See, delete or refund transactions:** choose **Debug → StoreKit → Manage Transactions**. To buy Pro again from scratch, select the `pro_lifetime` transaction and click **Delete**. Control-click a transaction for its other actions, such as a refund. After a refund, the next check of what is owned should come back "not owned".
- **Ask to Buy (pending):** select `Increment.storekit` in Xcode, open **Configuration Settings**, and turn on **Ask to Buy** under Purchase Options. Buy, tap **Ask**, then Control-click the transaction in the transaction manager and choose **Approve** or **Decline**. Turn it off again when you're done.
- **Interrupted purchases:** with the file selected, choose **Editor → Enable Interrupted Purchases**.

These local transactions are signed by Xcode, not the App Store. They never reach App Store Connect and don't count as real purchases.

## Checking custom exercises after a refund

Make a custom exercise (Library **+**), put it in a routine and log a workout with it. Then either refund the `pro_lifetime` transaction (Manage Transactions), or set Settings, Developer, **Pro source** to **Free** (in memory, resets on relaunch, writes nothing). Check:

- **New exercise** (the Library **+** and the "Create" row) and **Edit** on the custom exercise both open and take typing, but the bottom button reads **Unlock Pro** with a lock and opens the Paywall. Nothing is saved. Set Pro source to **Pro** and it reads Save exercise / Save changes.
- The exercise is still in the Library, the routine picker (add it to another routine), the Progress picker and Workout history, and its routine starts and finishes with Target, Offer and Records.
- **Delete exercise** on its detail still works.
- Refund while a workout with it is open: the workout can be resumed and finished.

The tests for this are in `src/library/customExercisesAfterRefund.test.ts`.

## What this can't test

- Android. Play Billing needs the app on an internal testing track with license testers (ticket 03).
- The App Store sandbox and real Apple ID sign-in, including what happens when the lifter is signed out. Those are the owner's device checks in ticket 04.

## Sources

- Apple, [Setting up StoreKit Testing in Xcode](https://developer.apple.com/documentation/xcode/setting-up-storekit-testing-in-xcode)
- Apple, [Testing In-App Purchases in Xcode](https://developer.apple.com/documentation/storekit/testing-in-app-purchases-in-xcode)
- Apple, [Testing Ask to Buy in Xcode](https://developer.apple.com/documentation/storekit/testing-ask-to-buy-in-xcode)
