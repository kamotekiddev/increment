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
- Exercise detail: how-to steps, target muscles, equipment, and a History tab with past sessions and record tags.
- An empty state when a search finds nothing, with a shortcut to create a custom exercise (Pro).
- Library content must come from a source whose license allows commercial use, or be written in-house.

### Routines
- Create a routine with a name, the days it repeats, and its exercises from the library.
- For each exercise, set sets, a rep range and rest, plus its overload rule.
- Reorder exercises in a reorder mode (saved on Done), remove them with a confirmation, or delete the routine with a confirmation that says its workouts are deleted too.
- Free users can have up to **2 routines**. Adding a 3rd shows a limit pop-up. In Phase 1 the pop-up has no upgrade button; the link to the paywall arrives in Phase 3.

### Live workout
- Start a workout from a routine. Each exercise shows its Target in a banner and its set rows prefilled to the Target; a first workout with no Target has a blank weight and reps at the bottom of the rep range.
- Set table with a read-only Last column (the same set from the last finished workout of this routine exercise), weight and reps typed into plain number inputs (no −/+ buttons), done checks. The set count is fixed to the plan: no Add set and no remove control. A set cannot be done while its weight is blank. Rows below an edited row follow it until touched or done.
- The engine judges done sets by plan position, so an unchecked set in the middle is a gap, not a shift.
- An in-progress workout is saved at every edit and resumes after a crash or a closed app. Only one workout is in progress at a time; starting another asks Resume or Discard. An in-progress bar above the tab bar reopens it.
- The ⋯ menu has Discard workout behind a confirmation. Finish confirms when sets are unchecked or an exercise is skipped, then drops unchecked sets and leaves out exercises with no done set (not a Miss). With no set done, Finish offers Discard.
- Routine lock: the routine of the workout in progress cannot be edited or deleted until it is finished or discarded ("Finish or discard your workout first"); other routines stay editable.
- After Finish, each exercise whose progression is Earned gets its own Offer screen, one at a time in workout order: a progress bar and count, the current Target → stepped-up Target, and only two buttons, Go up and Stay. A tap saves the answer and opens the next screen. Answers are final, and back and swipe are disabled so no Offer is skipped. If the app is killed mid-way, unanswered Offers count as Stay, and a Stay returns the Offer after the next Clean workout. There is no Offer on a Deload workout.
- Then the summary shows duration, sets and volume (total reps when volume is 0), and one card per exercise with how it went and the next Target. It only reports. These screens cannot be reopened; a killed app reopens on the normal tab.
- Not yet (later phases): notes, rest timer, screen stay-awake, records on the summary (Phase 2).

### Progressive overload
- **Free**: one simple rule, chosen from the exercise's load type. Weighted exercises add the Jump, and bodyweight exercises add reps. Progression is Earned after 3 clean workouts in a row, then the app asks the lifter whether to progress.
- **Pro**: your own rule per exercise. Choose the step (add weight, add reps, or both), the rep step, how many clean workouts in a row earn progression (1–5), what happens after misses ("if you miss twice in a row: keep the weight / drop 10%"), and deload weeks (off unless you turn them on). A live preview shows the result before you save, e.g. "hit 8 on every set and it becomes 65 kg".
- Targets round to a multiple of your Jump.

### Units (kg / lb)
- A global preference in Settings, also switchable during a workout.
- Every weight is stored once, in kg, along with the unit it was entered in. Switching converts the display only, so switching back and forth never changes stored values.

### Progress
- Records worked out from logged sets: heaviest set, estimated 1-rep max, most volume. They are never stored separately, so they can't drift.
- Free: top set, record pills and a records list. Pro: charts and an All records screen.

### Today
- A date line, the week strip, and a swipeable deck of one card per Routine planned today (name, exercise count, Start; Done and In progress cards are white).
- Rest day: a recovery banner with this week's workouts done, and the next planned Routine with its first 3 exercises and Targets. No Start on a rest day.
- States for no routine yet and for routines with no days set. No settings gear until Phase 2, no ready-made plans or empty workout (see `.scratch/phase-1-today/spec.md`).

### Settings
- Units, smallest weight jumps by equipment, default rest, show previous set, keep screen awake, light and dark theme, reminders.
- Your data: backup, automatic backups, export, delete all data (with a typed confirmation).

### Onboarding
Welcome → Goal → Experience → Schedule → Equipment → Units → Your plan → Reminders, with a Quick start path for people who skip.
- Every question can be skipped.
- The answers pick a starter split (full body, push/pull/legs, upper/lower) that fits within the 2-routine free limit. **Open:** push/pull/legs is 3 routines, so the plan generator in Phase 4 must change the split or the limit.
- Permission for reminders is asked after the plan is shown, not before.
- **"I already have Increment"** goes straight to Welcome back to restore a Pro purchase and a backup, skipping the questions.

## Pro (one-time purchase)

| Feature | Free | Pro |
|---|---|---|
| Exercise library | ✓ | ✓ |
| Log workouts | Unlimited | Unlimited |
| Routines | 2 | Unlimited |
| Overload rules | 1 simple (by load type) | Your own |
| Charts and records | – | ✓ |
| Custom exercises | – | ✓ |
| Move to a new phone | – | ✓ |
| Automatic backups | – | ✓ |
| Export to CSV or PDF | – | ✓ |
| Plate calculator and warm-ups | – | ✓ |

Rules:
- **Backups are Pro-only.** A free user cannot create a backup file in any way; the backup row in Settings is locked and opens the paywall.
- Automatic backups run after every workout, daily, weekly or monthly, checked when the app opens. The last N files are kept. On iOS they go to the app's folder or iCloud Drive; on Android, to a folder the user picks.
- Paywall copy: "Unlock Pro · [Price]" with "One-time payment. No subscription. Works offline." Restore purchase is on the paywall and on Welcome back.
