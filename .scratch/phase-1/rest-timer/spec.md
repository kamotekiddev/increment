Status: ready-for-agent

# Phase 1 · Feature 6 · Rest timer

Part of Phase 1 (see `.scratch/phase-1/map.md`). Needs: Live workout core (feature 3). Decisions below come from a grilling session on 2026-11-17.

## Problem Statement

Between sets the lifter has no way to time their rest inside the app. They watch the clock on their phone or guess, and the app already knows how long they planned to rest (the Rest length on each Routine exercise).

## Solution

When the lifter marks a set done, a Rest timer starts from that Routine exercise's Rest length and shows as a panel pinned to the bottom of the live workout screen: a progress ring with the countdown, a "Next up" line, and **−15s**, **+15s** and **Skip** buttons. At zero the phone buzzes. If the lifter is finished with that exercise, the screen moves on to the next one. When the app is in the background, a local notification does the nudge.

The panel is already drawn in the design canvas (`Workout.dc.html`). Only its "Next up" line changes (see Further Notes).

## User Stories

**Starting and stopping**
1. As a lifter, I want a rest to start when I mark a set done, using that exercise's Rest length, so that I do not have to start a timer myself.
2. As a lifter, I want no timer after the last open set of the Workout, so that I am not made to rest when I am done. "Open" means any set in any exercise that is not marked done, so jumping ahead and finishing the last exercise first still starts a rest while other sets remain.
3. As a lifter, I want checking another set during a rest to restart the timer from that set's Rest length, so that the timer always counts the rest after the set I just did. There is only ever one timer.
4. As a lifter, I want unchecking the set that started the running timer to cancel it, and unchecking any other set to leave it alone, so that a mis-tap does not leave a rest running for a set I did not finish.
5. As a lifter, I want Skip to end the rest at once, with no buzz and no screen change, so that I can start my next set early.
6. As a lifter, I want Finish and Discard to clear the timer, so that nothing carries into the summary or the next workout.

**Adjusting**
7. As a lifter, I want **−15s** and **+15s** to change this rest only, never the Routine exercise's stored Rest length, so that a one-off change does not rewrite my plan. The countdown cannot go below zero, and a −15s that reaches zero ends the rest the same way a countdown reaching zero does.

**The panel**
8. As a lifter, I want the panel to show only while a rest runs, pinned to the bottom, so that it never covers the set table when I am not resting. While it shows, the list scrolls clear of it.
9. As a lifter, I want the ring to show how much of this rest is left and the centre to read the time as `m:ss` ("1:42") with the word "rest" under it.
10. As a lifter, I want a "Next up" line saying what comes after this rest: the next open set in this exercise as `Set 3 · 62.5 kg × 8` (reps only when the weight is blank or the exercise is bodyweight), or, when this exercise has no open sets left, the next exercise with an open set as `Overhead press · 42.5 kg`, so that I know what to load.
11. As a lifter, I want the timer to keep running when I minimize the workout or move between exercises, so that leaving the page does not lose my rest.

**At zero**
12. As a lifter, when the countdown reaches zero and this exercise still has an open set, I want one buzz and the panel to hide, so that I know it is time without the screen changing under me.
13. As a lifter, when the countdown reaches zero and the exercise I just finished has no open sets left, I want one buzz and the screen to move to the next exercise that has an open set (wrapping past the end to the first earlier one), so that I am looking at what to do next. This happens only if I am still viewing the exercise I finished; if I moved to another exercise myself, I only get the buzz and nothing moves.
14. As a lifter, I want the timer to stay correct when my phone locks or I switch apps, so that a 90 second rest ends after 90 seconds whatever the app was doing.
15. As a lifter, when I come back to the app after a rest ended in the background, I want it resolved as at zero without a buzz (the panel hides, or the screen moves on under story 13), because I am already looking at the screen.

**Notification**
16. As a lifter, I want a notification when the rest ends while the app is in the background, so that I can leave the phone on the bench and still know.
17. As a lifter, I want to be asked for notification permission once, the first time a rest starts, only if the app has not asked yet, so that I see why it is asked. If I say no, the timer works without a notification and the app does not ask again. The onboarding flow (Phase 4) will ask for Reminders too; once it has, this prompt never shows.
18. As a lifter, I do not want a banner on top of the screen while the app is open, because the buzz already told me.

## Implementation Decisions

- **Pure module** for the rules, no React and no I/O, in `src/workout/`. It takes plain inputs and returns plain outputs:
  - what happens when a set is marked done or unmarked (start, replace, cancel or leave alone; none when no open sets remain);
  - the "Next up" line;
  - what happens at zero (hide, or advance to a given exercise);
  - adding or removing 15 seconds with the floor at zero;
  - the remaining time and ring fraction from an end time and a clock value.
- **The timer is an end time, not a counter.** The store holds `endsAt`, the rest's total length, the id of the set that started it and the exercise it belongs to. The screen reads the clock to render. This keeps it right when the app sleeps and gives feature 7 (crash resume) one value to save.
- **State lives in a small Zustand store** outside the screen so the timer survives minimizing the workout (the live screen unmounts when the lifter leaves it). The project's stack rule names Zustand; nothing uses it yet, so this is its first store.
- **Haptics:** `expo-haptics`, one notification-style buzz at zero. No sound in this feature.
- **Notification:** `expo-notifications` with a `TIME_INTERVAL` local trigger, scheduled when a rest starts and cancelled on Skip, replace, unmark, ±15s (rescheduled), Finish and Discard. The config plugin runs with `enableRemoteNotifications: false`. Permission is requested only when `getPermissionsAsync` says undetermined. Android needs a notification channel for it. The foreground handler hides banner and sound; the in-app buzz covers that case.
- All new packages are added with `npx expo install` and checked against the SDK 58 docs.
- Rest length is read from the Routine exercise as it was when the Workout started (the same snapshot the Workout holds). No schema change and no migration. Nothing new is stored.
- No ADR: the choices are easy to change later.

## Testing Decisions

- One pure seam, tested with Jest: the rules module above. Example tests:
  - checking set 1 of a 90 s exercise starts a 90 s rest;
  - checking set 2 at 0:50 left restarts at the new exercise's Rest length;
  - unchecking the starting set cancels, unchecking another set does not;
  - the last open set anywhere starts nothing, and jumping to the last exercise first still starts a rest;
  - "Next up" for a middle set, for an exercise's last set, for a blank weight and for a bodyweight exercise;
  - zero with open sets in the exercise hides; zero with the exercise finished advances, wraps around, and does not advance when the lifter is viewing another exercise;
  - +15s, and −15s flooring at zero;
  - a rest that ended while away resolves without a buzz.
- Not unit-tested: the panel, the haptic, the notification and permission calls, and the store wiring (device check). The device checklist goes in the last ticket.
- Prior art: `markDone`, `startDecision` and `elapsedText` tests in `src/workout/`.

## Out of Scope

- Sound, and a setting for rest alerts or default Rest length (Settings, Phase 2).
- Keep-awake (Phase 2).
- Saving the timer across a killed app (feature 7); the end-time shape is chosen so it can.
- Editing Rest length from the live workout.
- Notes and records on the summary.

## Further Notes

- Mockup: only the "Next up" line of `Workout.dc.html` changes. It names the next exercise even when the current one still has sets open; it should name the next open set. There is no zero or "Rest over" state to draw, because the panel hides at zero. The edit is prepared locally and published only when the owner asks, as with earlier features.
- Risk to check on a real Android phone: without the exact-alarm permission (denied by default on Android 14+), the docs say scheduled notifications arrive "at an approximate time", so a 90 second rest could notify late. The docs do not say whether a `TIME_INTERVAL` trigger counts as exact-time. The in-app buzz is unaffected. If it is late, the decision to take is whether to request the permission (a Play policy question), which is the owner's call.
- Auto-advance wraps past the last exercise to the first earlier one with an open set. This was not explicitly discussed; flag it if you disagree.
- Glossary: **Rest timer** added.
- `docs/product.md` and `docs/screens.md` say "Not yet: rest timer"; both are updated with this feature. `docs/product.md` also keeps saying onboarding asks for notification permission, with a note that the rest timer asks earlier until then.
