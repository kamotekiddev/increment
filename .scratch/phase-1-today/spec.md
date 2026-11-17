Status: ready-for-agent

# Phase 1 · Feature 5 · Today

Part of Phase 1 (see `.scratch/phase-1-core-training-loop/map.md`). Needs: Live workout core (feature 3). Decisions below come from a grilling session on 2026-11-17.

## Problem Statement

The Today tab is a placeholder. The lifter opens the app and cannot see what is planned for today, how their week is going, or start the day's workout without going to the Routines tab.

## Solution

Today shows a week strip (Sun to Sat) and a swipeable deck of accent hero cards, one per Routine planned for today, each with the Routine name, its exercise count and a Start button. It also has states for no Routines, no Routine planned today (a rest day), a Routine already done (a white card), and a Workout in progress (a white card).

Decision 2026-11-17: the first design, a compact card with only the name and Start, was too compact. The owner approved the accent hero deck from a prototype instead.

## User Stories

**Cards**
1. As a lifter, I want the Routines planned for today as a deck of cards, one visible at a time, and to swipe the top card away to see the next, so that nothing planned is hidden. With one Routine it is a plain card, with no swipe.
2. As a lifter, I want each card to show the Routine name, its exercise count ("5 exercises", "1 exercise") and a Start workout button, so that I know what I am about to start (no exercise list, no time estimate).
3. As a lifter, I want Start to open the live workout through the existing start rule, so that starting works the same everywhere.
4. As a lifter, I want a Routine I finished today to be a white card with a "Done" check instead of Start, so that I do not start it twice by accident.
5. As a lifter, I want a discarded workout not to count as done, so that Start comes back.
6. As a lifter, I want the card of the Routine with a Workout in progress to be a white card reading "In progress" with no button, so that I use the floating in-progress bar to return.
7. As a lifter, I want Start on another card, while one is in progress, to open the existing Resume-or-discard sheet, so that only one workout exists at a time.
8. As a lifter, I want Routines still to do shown first and Done ones behind them in the deck (Routines-tab order within each group), with no extra message when everything is Done, so that the top card is what I do next.

**Week strip**
9. As a lifter, I want the current week shown Sun to Sat with three-letter names, so that it matches my calendar.
10. As a lifter, I want today highlighted, planned days marked with a dot, and days with a finished workout marked with a check, so that I can read my week at a glance.
11. As a lifter, I want a check on any day I finished a workout, planned or not, so that extra sessions show.
12. As a lifter, I want planned days that passed without a workout to have no "missed" styling, so that the strip never makes me feel guilty.
13. As a lifter, I want the strip not to be tappable, so that it stays a glance.

**Days and time**
14. As a lifter, I want a workout to belong to the day it was started, in local time, so that a session over midnight counts for the day I began it.
15. As a lifter, I want Today to roll over at local midnight if the app stays open, so that it never shows yesterday.

**Empty and rest states**
16. As a lifter with no Routines, I want "No routines yet" and a Create routine button that opens New routine, so that I can begin at once. The strip still shows.
17. As a lifter on a rest day, I want "Rest day. Next: Push on Thu" and no Start button, so that I know when I train next. Starting an unplanned Routine happens from the Routines tab.
18. As a lifter whose Routines have no days set, I want "No training days set. Pick days on a routine to plan your week.", so that I know why Today is blank.

**Header**
19. As a lifter, I want a "Today" title, with no settings gear until Settings exist (Phase 2).

## Implementation Decisions

- Deck order: Routines still to do (Start or In progress) in Routines-tab order, then Done ones in Routines-tab order. The builder returns the cards in this order and each card carries the Routine's exercise count.
- The deck is a top card plus up to two layers underneath (offset 14 pt, scaled 0.95 and 0.90, each lighter). A horizontal drag tilts the top card; the next card rises, grows to full size and turns to full accent, its content fading in by 150 pt of drag. Past 70 pt or a quick flick the top card goes to the back; otherwise it springs back. Dots and "1 of 2 · swipe" show with two or more cards. A vertical drag and a tap on Start are not taken by the deck. Screen readers get a "next routine" action; reduced motion skips the fly-off animation.
- A Routine appears on Today when its days include today's weekday. Days stay a bitmask, Monday = bit 0; the strip only displays Sunday first.
- "Done" for a card: a finished Workout of that Routine whose start falls on today (local time). The strip check: a finished Workout of any Routine started that day. "In progress" comes from the existing in-progress query.
- All of it is derived from Routines and Workouts. Nothing new is stored and there is no schema change.
- "Next: Push on Thu" is the first planned Routine after today in week order, wrapping to next week. If several share that day, the first in Routines-tab order is named.
- Start uses the existing start decision (start, or Resume-or-discard).
- The dev-only gallery link stays under `__DEV__`.
- No ADR: the choices are easy to change later.

## Testing Decisions

- One pure seam: a Today-state builder over plain inputs (Routines with days, order and exercise count, finished and in-progress Workouts with start times, today's date). It returns the strip marks and the screen state (cards, rest day with next day, no days set, no routines).
- Example tests: Done cards go behind the ones still to do; exercise count on each card; two Routines share Mon; Routine Done; discarded workout does not count; in progress; rest day with next planned day and wrap into next week; no days set; no Routines; session started 11:50 pm counts for its start day; check on an unplanned day; Sunday-first strip.
- Not unit-tested: the queries, the screen and the swipe (device check). A short device checklist goes in the last ticket.
- Prior art: `bannerText`, `startDecision` and `routineLock` tests in the workout module.

## Out of Scope

- Workout history and records (Phase 2); tapping a strip day.
- Settings and the gear (Phase 2); reminders.
- Starting an unplanned Routine from Today.
- Rest timer (feature 6) and crash resume (feature 7).

## Further Notes

- Glossary: **Rest day** added.
- `docs/screens.md` is updated with this spec.
