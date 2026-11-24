# Product

## Vision

Most gym apps record what you did. Increment tells you **what to do next**: when you've earned more weight, how much to add, and a target you can actually load. It does this offline and without an account, and you pay once.

## Who it's for

- Lifters who follow a program and want progressive overload done for them, transparently.
- People who train at more than one gym, some in kg and some in lb.
- People who don't want a subscription, an account, or their data in someone else's cloud.

## Core features

### Exercise library
- Searchable list with filters for muscle group and equipment.
- Exercise detail: how-to steps, target muscles and equipment.
- An empty state when a search finds nothing, with a shortcut to create a custom exercise (Pro).
- Library content must come from a source whose license allows commercial use, or be written in-house.

### Routines
- Create a routine with a name, the days it repeats, and its exercises from the library.
- For each exercise, set sets, a rep range and rest, plus its overload rule.
- Reorder exercises in a reorder mode (saved on Done), remove them with a confirmation, or delete the routine with a confirmation that says its workouts are deleted too.
- Free users can have up to **2 routines**. Adding a 3rd shows a limit pop-up. The pop-up has no upgrade button until feature 2 of Phase 3 (the Paywall itself exists, opened from Settings).

### Live workout
- Start a workout from a routine. Each exercise shows its Target in a banner and its set rows prefilled to the Target; a first workout with no Target has a blank weight and reps at the bottom of the rep range.
- Set table with a read-only Last column (the same set from the last finished workout of this routine exercise), weight and reps typed into plain number inputs (no −/+ buttons), done checks. The set count is fixed to the plan: no Add set and no remove control. A set cannot be done while its weight is blank. Rows below an edited row follow it until touched or done.
- The engine judges done sets by plan position, so an unchecked set in the middle is a gap, not a shift.
- An in-progress workout is saved at every edit. When the app is reopened after being killed it opens straight into the workout, on the first exercise with an open set, if the last edit was within 12 hours; otherwise it opens on Today and the bar reopens it. Switching away and back never reopens it. Only one workout is in progress at a time; starting another asks Resume or Discard. An in-progress bar above the tab bar reopens it.
- The ⋯ menu has Discard workout behind a confirmation. Finish confirms when sets are unchecked or an exercise is skipped, then drops unchecked sets and leaves out exercises with no done set (not a Miss). With no set done, Finish offers Discard.
- Routine lock: the routine of the workout in progress cannot be edited or deleted until it is finished or discarded ("Finish or discard your workout first"); other routines stay editable.
- After Finish, each exercise whose progression is Earned gets its own Offer screen, one at a time in workout order: a progress bar and count, the current Target → stepped-up Target, and only two buttons, Go up and Stay. A tap saves the answer and opens the next screen. Answers are final, and back and swipe are disabled so no Offer is skipped. If the app is killed mid-way, unanswered Offers count as Stay, and a Stay returns the Offer after the next Clean workout. There is no Offer on a Deload workout.
- Then the summary shows duration, sets and volume (total reps when volume is 0), and one card per exercise with how it went and the next Target. It only reports. These screens cannot be reopened; a killed app reopens on the normal tab.
- Rest timer: marking a set done starts a countdown from that exercise's Rest length, shown as a panel pinned to the bottom of the screen with a progress ring, the time as m:ss, a "Next up" line (the next open set, e.g. "Set 3 · 62.5 kg × 8", or the next exercise with an open set once this one is finished) and -15s, +15s and Skip. There is only one timer: marking another set restarts it, unmarking the set that started it cancels it, and no rest starts after the last open set of the workout. -15s and +15s change this rest only, never the stored Rest length. At zero the phone buzzes and the panel hides; if the exercise is finished and the lifter is still on it, the screen moves to the next exercise with an open set (wrapping past the end). The timer is an end time, so it stays right while the app is minimized or the phone is locked, and a rest that ended while away resolves without a buzz. While the app is in the background a local "Rest over" notification arrives at zero. Finish and Discard clear the timer. The timer is not saved: after a killed app no rest is running and its "Rest over" alert is cancelled.
- Records show as accent pills on the Workout summary cards. Not yet (later phases): notes.

### Progressive overload
- **Default rule**: an exercise added to a routine starts with a rule chosen from its load type. Weighted exercises add the Jump, and bodyweight exercises add reps. Progression is Earned after 3 clean workouts in a row, then the app asks the lifter whether to progress.
- **Your own rule per exercise, free for everyone**: the Overload rule panel (from the Exercise setup sheet) sets how it progresses (Weight first adds the Jump, Double progression adds the Jump and a rep, Reps only adds a rep), "Add each time", what happens after two misses in a row (keep the weight / drop 10%), and Deload weeks (off unless you turn them on: every 6 weeks, one workout at 60%). The rep step (1) and the clean workouts that earn progression (3) are not editable. A bodyweight exercise steps by reps only, so its panel shows only the preview. A live preview shows the result before you save, e.g. "Hit 8 on every set and it becomes 65 kg". A due Deload is marked on the workout, so it does not count toward the Streak and the next one counts its weeks from there.
- **Jump per routine exercise**: each exercise in a routine has its own Jump ("Add each time"), one for kg and one for lb, 2.5 kg / 5 lb until you change it, so a 5 kg leg press or a 1 kg overhead press only changes that exercise. Switching unit uses the other unit's Jump and never changes either. There is no Weight jumps screen.
- **Bodyweight and weighted twins**: an exercise done both with and without added weight is two exercises (Pull-up and Weighted pull-up). A bodyweight exercise steps by reps and has no weight box in the live workout; the weighted twin steps by weight with its own Jump. Lifters who logged belt weight on the plain exercise switch their routine to the twin to keep stepping by weight; their history stays where it was.
- Targets round to a multiple of your Jump: a step goes up to the next one, and a drop or deload down. After you switch unit, a Target set in the other unit moves down to a multiple of your Jump so you can load it (62.5 kg with a 5 lb Jump is 135 lb, not 140 lb), and Go up is one Jump above that. Pre-filled rows and the Last column round down the same way. Changing a Jump never moves a Target you already have.

### Units (kg / lb)
- A global preference, chosen in onboarding and changeable in Settings, where tapping the other unit asks you to confirm before it saves. There is no switch on the live workout screen, so a workout is logged in one unit.
- Every weight is stored once, in kg, along with the unit it was entered in. Switching converts the display only, so switching back and forth never changes stored values.

### Progress
- Records worked out from logged sets: heaviest set, estimated 1-rep max, most volume. They are never stored separately, so they can't drift.
- Free: top set, record pills and a records list. Pro: charts and an All records screen. The Progress tab shows one exercise at a time (an exercise picker): its top set, a locked chart preview and a Records card with its records. A bodyweight exercise has no weight, so it shows Most reps in a set and Most reps in a workout instead of Heaviest set and Estimated 1-rep max.
- Workout history, from a History button on Progress: the lifter's finished Workouts, newest first, under month headers; each opens to its exercises, the Target each had and their done sets, in the lifter's unit. Read-only and free. Record tags arrive with Records (Phase 2).

### Today
- A date line, the week strip, and a swipeable deck of one card per Routine planned today (name, exercise count, Start; Done and In progress cards are white), with the top Routine's first 3 exercises and Targets listed under the deck.
- Rest day: a recovery banner with this week's workouts done, and the next planned Routine with its first 3 exercises and Targets. No Start on a rest day.
- States for no routine yet and for routines with no days set (a card with a Plan your week button). No settings gear until Phase 2, no ready-made plans or empty workout (see `.scratch/phase-1/today/spec.md`).

### Settings
- Units, default rest, show previous set, keep screen awake, light and dark theme, reminders.
- **Default rest** (15 s to 10:00, default 1:30) is the rest a newly added exercise starts with; exercises already in a routine never change. **Show previous set** (on by default) shows the Last column in the live workout. **Keep screen awake** (on by default) keeps the screen lit while a live workout is open.
- Your data: backup, automatic backups, export, delete all data (with a typed confirmation).

### Onboarding
Welcome → Goal → Experience → Schedule → Equipment → Units → Your plan → Reminders, with a Quick start path for people who skip.
- Every question can be skipped.
- The answers pick a starter split (full body, push/pull/legs, upper/lower) that fits within the 2-routine free limit. **Open:** push/pull/legs is 3 routines, so the plan generator in Phase 4 must change the split or the limit.
- Permission for reminders is asked after the plan is shown, not before. Until Phase 4 builds onboarding, the rest timer asks for notification permission once, at the first rest, and only if the OS has not been asked yet. A denial is never asked again and the timer still works without the notification.
- **"I already have Increment"** goes straight to Welcome back to restore a Pro purchase and a backup, skipping the questions.

## Pro (one-time purchase)

| Feature | Free | Pro |
|---|---|---|
| Exercise library | ✓ | ✓ |
| Log workouts | Unlimited | Unlimited |
| Routines | 2 | Unlimited |
| Charts and records | – | ✓ |
| Custom exercises | – | ✓ |
| Move to a new phone | – | ✓ |
| Automatic backups | – | ✓ |
| Export to CSV or PDF | – | ✓ |
| Plate calculator and warm-ups | – | ✓ |

Rules:
- **Backups are Pro-only.** A free user cannot create a backup file in any way; the backup row in Settings is locked and opens the paywall.
- Automatic backups run after every workout, daily, weekly or monthly, checked when the app opens. The last N files are kept. On iOS they go to the app's folder or iCloud Drive; on Android, to a folder the user picks.
- Paywall copy: "Unlock Pro · [Price]" with "One-time payment. No subscription. Works offline." Restore purchase is on the paywall (reached after onboarding from the Increment Pro card at the top of Settings) and, in Phase 4, on Welcome back.
- **Paywall states:** loading (button disabled, spinner), loaded (the store's localized price), offline ("Connect to the internet to buy Pro."), Payment pending (Android cash or bank payments, iOS Ask to Buy; Pro switches on by itself once the store confirms, even if the app was closed) and in flight. Cancelling the store's sheet changes nothing; any other failure shows "Purchase didn't go through" and says nothing was charged. Restore purchase answers with Pro unlocked, Payment pending, "No purchase found" (check the Apple ID or Google account) or "Couldn't reach the App Store / Google Play".
- **Pro unlocked shows once each time Pro switches on, and never over a live workout** (owner decision 2026-11-24): during a workout it waits until the workout is finished or discarded, or the next launch that doesn't resume one.
- **Refunds:** when the store reports a purchase gone (checked at launch and on return to the app), Pro switches off. Everything the lifter made stays; only Pro actions lock. Routines past the 2 oldest become Locked routines (Phase 3 feature 2); the other Pro features lock as they are built.
