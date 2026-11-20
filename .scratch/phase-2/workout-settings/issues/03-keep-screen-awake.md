# 03: Keep screen awake

**What to build:** A Keep screen awake switch in the Settings Workout card. On keeps the screen lit while the live workout is open, including during a rest; leaving the workout, or turning the switch off, brings back the phone's normal auto-lock.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] A "Keep screen awake" switch row under Show previous set in the Workout card, on by default, applied at once and kept after closing the app
- [ ] The wake lock is held only while the live workout screen is open and the setting is on, and released on leaving it (finish, discard, back to Today) and when the setting turns off. Nowhere else in the app holds it
- [ ] The rest timer and its "Rest over" notification behave the same either way
- [ ] Check the Expo SDK 58 docs for the `expo-keep-awake` API before using it (already installed)
- [ ] Jest: the pure decision (hold when the live workout is open and the setting is on; release otherwise). The native call itself is not unit-tested
- [ ] Type check, lint and tests pass
