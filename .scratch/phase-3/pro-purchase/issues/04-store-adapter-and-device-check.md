# 04: Store adapter and the device check

**What to build:** The real store adapter behind ticket 01's interface. Then prove on both phones the assumptions ADR 0004 rests on, before anything else builds on them.

**Blocked by:** 01, 03

**Status:** ready-for-agent (the device checks are ready-for-human)

- [ ] The adapter has four calls: connect, fetch the Pro product (localized price string), buy, and ask what is owned. Asking what is owned maps to owned+purchased, owned+pending, not owned, or no answer. Every error and timeout becomes "no answer".
- [ ] Any purchased but unacknowledged `pro_lifetime` is finished with `isConsumable: false` (the Android acknowledge) on every check.
- [ ] The adapter never imports into Jest code paths; tests keep using the fake.
- [ ] **Owner, on an iPhone and an Android phone.** Write each result in this file under `## Comments`.
  - Buy `pro_lifetime` with a test account. Turn on airplane mode, kill the app and relaunch: asking what is owned still returns **owned**.
  - Android, on a Pro install, with the Play Store signed out or disabled: does asking come back as an **error** or as an **empty list**? If it's an empty list, the adapter must map that case to "no answer", never "not owned", or a real buyer loses Pro.
  - iOS, on a Pro install, signed out of the Apple ID in Settings: the same question.
  - iOS: a launch and a return to the foreground never show an App Store sign-in or password prompt. If expo-iap's "what is owned" call prompts, the launch check uses a silent call and only the Restore button uses the syncing one (update the spec).
- [ ] If any check shows the store can't tell "not owned" from "can't answer", or that it answers nothing offline, stop and bring it back to the owner, since ADR 0004 then needs revisiting.
