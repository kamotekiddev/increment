# Phase 4 · Onboarding and polish: map

Gate (from the roadmap): install to first logged set in under 3 minutes. Checked by the owner after feature 7.

Phase 3's gate was met (owner checked on phones, 2026-11-27), so Phase 4 may start. Phase 4 is split into seven features, the same way as Phases 1 to 3. Each feature ends with something usable on a phone, gets its own full spec at `.scratch/phase-4/<feature-slug>/spec.md` when it becomes next (not before), and is built on its own branch from `main`. Grilled 2026-11-27.

Before feature 3: the **free routine limit goes from 2 to 3** as an extra Phase 3 ticket, `.scratch/phase-3/free-routine-limit-3/`, so the plan generator can make up to 3 routines.

## Features, in build order

| # | Feature | Needs first |
|---|---|---|
| 1 | Onboarding shell and Quick start | Phase 3 |
| 2 | Questions | 1 |
| 3 | Plan generator and Your plan | 2, and the limit ticket |
| 4 | Reminders step and Welcome back | 1, 3 |
| 5 | Accessibility | 1 to 4 |
| 6 | Haptics | 1 to 4 |
| 7 | Splash screen (design, owner approval, then build) | none |

### 1 · Onboarding shell and Quick start
Welcome, with Get started and "I already have Increment", and the Quick start path. A fresh install shows Welcome once. An `onboarded` column on `user_settings` records that it is done: the migration sets it for every existing install, and Quick start, Start training and Welcome back's Done set it. Restore from a backup and Delete all data never reset it. Onboarding writes nothing (no routines, no unit) until Start training or Quick start is tapped. A killed app mid-questions starts again at Welcome.

### 2 · Questions
Goal (Build muscle, Get stronger, Stay fit and healthy, Lose fat), Experience (Just starting, Some experience, Experienced), Schedule (2 to 6 days a week plus a day picker; hint "3 days a week suits a Full body A/B split."), Equipment (multi-select: Full gym, Home gym with a barbell, Dumbbells only, Bodyweight only) and Units (kg or lb). Every question has Skip, which goes to Quick start. Screens are drawn on the design canvas (`OnbGoal` to `OnbUnits`, `OnbQuick`).

### 3 · Plan generator and Your plan
The Schedule answer picks the split, and every split fits the 3-routine free limit:

| Days | Split | Routines |
|---|---|---|
| 2 | Upper/Lower | 2 |
| 3 | Full body A/B (A on the first and third day, B on the second) | 2 |
| 4 | Upper/Lower, each on 2 days | 2 |
| 5 to 6 | Push/Pull/Legs, repeated | 3 |

A skipped Schedule is 3 days, Mon, Wed, Fri. Exercises come from 28 hand-written lists (7 routine types × 4 equipment levels, 4 to 5 library exercises each); the richest ticked equipment option wins (Full gym, Home barbell, Dumbbells, Bodyweight), and no equipment ticked is Full gym. Goal sets sets, rep range and rest (Get stronger 4 × 3–6, 2:30; Build muscle 3 × 8–12, 1:30; Stay fit 3 × 10–15, 1:00; Lose fat 3 × 8–12, 1:00); Experience sets exercises per routine (Just starting 4, others 5) and sets (advanced +1). The Overload rule and Jump stay at the app defaults. Your plan lists the routines with Start training and "I'll build my own routines".

### 4 · Reminders step and Welcome back
The Reminders step comes after Start training when the plan has routine days: Turn on reminders asks the phone's permission once and turns the existing Settings switch on at the chosen time (7:00 AM, 12:00 PM, 6:00 PM preselected, or Other with the phone's time picker); Not now leaves it off. No days (own routines) skips the step. Welcome back, from "I already have Increment", is a new screen (to be drawn on the canvas): a Pro row (checking, unlocked or not found, with Restore purchase for another account), a Restore from a backup file row that reuses the existing restore flow, and Done, which marks onboarding done and opens Today.

### 5 · Accessibility
A full pass on the first-logged-set path (onboarding, Today, Routines, live workout, Offer, summary): VoiceOver and TalkBack labels, text still fitting at the largest text size, 44 pt targets and 4.5:1 text contrast, checked by hand on both phones. Every other screen gets labels and 44 pt targets only.

### 6 · Haptics
Light tap on checking a set, success on rest zero (as now), Finish and Offer Go up, a light tap on Stay, a selection tick on onboarding and picker choices, a warning on Discard workout and Delete everything. No new setting: the phone's own haptics setting decides.

### 7 · Splash screen (design, owner approval, then build)
The icon is done (owner, 2026-11-27, see `docs/design-system.md`, Logo and app icon). The splash is designed on the canvas and approved by the owner before any build starts: ticket 01 is the design, ticket 02 (build) stays blocked until the owner approves it. Spec: `.scratch/phase-4/splash-screen/`. Store screenshots, the Play feature graphic and the listing text are Phase 5 (store listings).

## Decisions so far
- Free routine limit 3, not 2 (extra Phase 3 ticket); it lets push/pull/legs fit. The "Open" note on this in `docs/product.md` is closed.
- Delete all data does not re-open onboarding. The open item in `docs/decisions.md` is closed.
- Phase 4 work needs the design canvas updated for: the Schedule hint ("Full body A/B"), a Welcome back screen, and Reminders and Quick start matching the rules above.
