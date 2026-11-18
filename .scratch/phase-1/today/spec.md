Status: ready-for-agent

# Phase 1 · Feature 5 · Today

Part of Phase 1 (see `.scratch/phase-1/map.md`). Needs: Live workout core (feature 3). Decisions below come from a grilling session on 2026-11-17.

## Problem Statement

The Today tab is a placeholder. The lifter opens the app and cannot see what is planned for today, how their week is going, or start the day's workout without going to the Routines tab.

## Solution

Today shows a week strip (Sun to Sat) and a swipeable deck of accent hero cards, one per Routine planned for today, each with the Routine name, its exercise count and a Start button. It also has states for no Routines, no Routine planned today (a rest day), a Routine already done (a white card), and a Workout in progress (a white card).

Decision 2026-11-17: the first design, a compact card with only the name and Start, was too compact. The owner approved the accent hero deck from a prototype instead.

## User Stories

**Cards**
1. As a lifter, I want the Routines planned for today as a deck of cards, one visible at a time, and to swipe the top card away to see the next, so that nothing planned is hidden. With one Routine it is a plain card, with no swipe.
2. As a lifter, I want each card to show the Routine name, its exercise count ("5 exercises", "1 exercise") and a Start workout button, so that I know what I am about to start (no exercise list on the card itself, it sits under the deck: story 22; no time estimate).
3. As a lifter, I want Start to open the live workout through the existing start rule, so that starting works the same everywhere.
4. As a lifter, I want a Routine I finished today to be a white card with a "Done" check instead of Start, so that I do not start it twice by accident.
5. As a lifter, I want a discarded workout not to count as done, so that Start comes back.
6. As a lifter, I want the card of the Routine with a Workout in progress to be a white card reading "In progress" with no button, so that I use the floating in-progress bar to return.
7. As a lifter, I want Start on another card, while one is in progress, to open the existing Resume-or-discard sheet, so that only one workout exists at a time.
8. As a lifter, I want Routines still to do shown first and Done ones behind them in the deck (Routines-tab order within each group), with no extra message when everything is Done, so that the top card is what I do next.

**Week strip**
9. As a lifter, I want the current week shown Sun to Sat with three-letter names, so that it matches my calendar.
10. As a lifter, I want each strip day to show its name over its date number, today filled with the accent (outlined on a rest day), days with a finished workout tinted, and planned days still to do marked with a dot, so that I can read my week at a glance.
11. As a lifter, I want a tint on any day I finished a workout, planned or not, so that extra sessions show.
12. As a lifter, I want planned days that passed without a workout to have no "missed" styling, so that the strip never makes me feel guilty.
13. As a lifter, I want the strip not to be tappable, so that it stays a glance.

**Days and time**
14. As a lifter, I want a workout to belong to the day it was started, in local time, so that a session over midnight counts for the day I began it.
15. As a lifter, I want Today to roll over at local midnight if the app stays open, so that it never shows yesterday.

**Empty and rest states**
16. As a lifter with no Routines, I want a card reading "No routine yet", "Build your own in a minute." and a "Create a routine" button that opens New routine, so that I can begin at once. The date line and strip still show.
17. As a lifter on a rest day, I want the title to read "Rest day", a "Recover today" banner and a "Next: Push" row with the weekday on the right, and no Start button, so that I know when I train next. Starting an unplanned Routine happens from the Routines tab.
18. As a lifter whose Routines have no days set, I want a card reading "No training days set", "Pick the days you train and Today will plan your week." and a "Plan your week" button that opens the Routines tab, so that I know why Today is blank and where to fix it. Same look as the "No routine yet" card (decided 2026-11-17 from a three-option preview; setting days on Today itself was set aside).
19. As a lifter on a rest day, I want the banner to say how my week is going: "N of M workouts done this week. Muscles grow while you rest." (M = Routine-days planned this week, a Routine on 3 days counting 3, two Routines on one day counting 2; N = finished workouts started this week, any Routine). When N is more than M, or M is 0 and N is at least 1, it says "N workouts done this week." ("1 workout" for one). With N = 0 it says "Muscles grow while you rest."
20. As a lifter on a rest day, I want a card listing the first 3 exercises of the next planned Routine with each Target (weight and unit, or reps for a bodyweight exercise) and "+ N more", or "No exercises yet" for an empty Routine, so that I can see what is coming. No step badges.

**Deck preview**
22. As a lifter with cards on Today, I want a "Today: Push" header (bold, "5 exercises" muted on the right) and, under the dots row, a card listing the first 3 exercises of the Routine on top of the deck with each Target and "+ N more" (or "No exercises yet"), so that I see what the top card holds before I start. It follows the deck: swiping changes it to the new top Routine. A Done Routine's preview still shows, read-only. No extra Start button. Decided 2026-11-17.

**Header**
21. As a lifter, I want a date line ("Thursday, 12 Nov") above the title in local time, and the title "Today" (or "Rest day" on a rest day), with no settings gear until Settings exist (Phase 2).

## Implementation Decisions

- Deck order: Routines still to do (Start or In progress) in Routines-tab order, then Done ones in Routines-tab order. The builder returns the cards in this order and each card carries the Routine's exercise count.
- The deck is a top card plus up to two layers underneath (offset 14 pt, scaled 0.95 and 0.90, each lighter). A horizontal drag tilts the top card; the next card rises, grows to full size and turns to full accent, its content fading in by 150 pt of drag. Past 70 pt or a quick flick the top card goes to the back; otherwise it springs back. Dots and "1 of 2 · swipe" show with two or more cards. A vertical drag and a tap on Start are not taken by the deck. Screen readers get a "next routine" action; reduced motion skips the fly-off animation.
- A Routine appears on Today when its days include today's weekday. Days stay a bitmask, Monday = bit 0; the strip only displays Sunday first.
- "Done" for a card: a finished Workout of that Routine whose start falls on today (local time). The strip check: a finished Workout of any Routine started that day. "In progress" comes from the existing in-progress query.
- All of it is derived from Routines and Workouts. Nothing new is stored and there is no schema change.
- "Next: Push on Thu" is the first planned Routine after today in week order, wrapping to next week. If several share that day, the first in Routines-tab order is named.
- The deck preview reuses the rest-day exercise card (`ExercisePreviewCard`) and the same preview query, keyed by the Routine on top. The deck reports its top card through `onTopChange` at mount and after each swap, not per drag frame.
- Start uses the existing start decision (start, or Resume-or-discard).
-
- No ADR: the choices are easy to change later.

## Testing Decisions

- One pure seam: a Today-state builder over plain inputs (Routines with days, order and exercise count, finished and in-progress Workouts with start times, today's date). It returns the strip marks and the screen state (cards, rest day with next day, no days set, no routines).
- Example tests: Done cards go behind the ones still to do; exercise count on each card; two Routines share Mon; Routine Done; discarded workout does not count; in progress; rest day with next planned day and wrap into next week; no days set; no Routines; session started 11:50 pm counts for its start day; check on an unplanned day; Sunday-first strip.
- Date line, screen title, banner text, strip labels and the Next card rows are pure and tested; the rest state carries `routineId`, the weekday and the week totals. The Next card's Targets come from the engine through the same history path Start uses, without writing anything.
- Not unit-tested: the queries, the screen and the swipe (device check). A short device checklist goes in the last ticket.
- Prior art: `bannerText`, `startDecision` and `routineLock` tests in the workout module.

## Out of Scope

- Workout history and records (Phase 2); tapping a strip day.
- Settings and the gear (planned for Phase 2); reminders.
- Ready-made plans (relates to the Phase 4 plan generator), "Start an empty workout", "Train anyway" and a week number. Train anyway reverses nothing: it was not built, so a rest day still has no Start button.
- Starting an unplanned Routine from Today.
- Rest timer (feature 6) and crash resume (feature 7).

## Further Notes

- Decision 2026-11-17 (design alignment): the empty and rest states, header and strip follow the owner's design; see ticket 06.
- Glossary: **Rest day** added.
- `docs/screens.md` is updated with this spec.
