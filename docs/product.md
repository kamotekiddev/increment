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
- Reorder and remove exercises, or delete the routine with a confirmation.
- Free users can have up to **3 routines**. Adding a 4th shows a limit pop-up that leads to the paywall.

### Live workout
- Set table with the previous set, weight and reps inputs, done checks, add set, and notes.
- Rest timer with −15 s, +15 s and skip; the screen stays awake.
- A target banner shows what to hit today to earn the next increase.
- An in-progress workout is saved continuously and resumes after a crash or a closed app.
- Workout summary: duration, sets, volume, new records, what goes up next time, and how it felt.

### Progressive overload
- **Free**: one simple rule. Add the weight jump once every set reaches the top of the rep range.
- **Pro**: your own rule per exercise. Choose weight first, double progression, or reps only; set the rep range, the jump size, what happens after misses ("if you miss twice in a row: keep the weight / drop 10%"), and deload weeks. A live preview shows the result before you save, e.g. "hit 8 on every set and it becomes 65 kg".
- Targets round to a weight you can load, based on your equipment's smallest jump and your gym's plates.

### Units (kg / lb)
- A global preference in Settings, also switchable during a workout.
- Every weight is stored once, in kg, along with the unit it was entered in. Switching converts the display only, so switching back and forth never changes stored values.

### Progress
- Records worked out from logged sets: heaviest set, estimated 1-rep max, most volume. They are never stored separately, so they can't drift.
- Free: top set, record pills and a records list. Pro: charts and an All records screen.

### Today
- This week's training days, today's session card, and states for no routine yet and rest day.

### Settings
- Units, smallest weight jumps by equipment, default rest, show previous set, keep screen awake, light and dark theme, reminders.
- Your data: backup, automatic backups, export, delete all data (with a typed confirmation).

### Onboarding
Welcome → Goal → Experience → Schedule → Equipment → Units → Your plan → Reminders, with a Quick start path for people who skip.
- Every question can be skipped.
- The answers pick a starter split (full body, push/pull/legs, upper/lower) that fits within the 3-routine free limit.
- Permission for reminders is asked after the plan is shown, not before.
- **"I already have Increment"** goes straight to Welcome back to restore a Pro purchase and a backup, skipping the questions.

## Pro (one-time purchase)

| Feature | Free | Pro |
|---|---|---|
| Exercise library | ✓ | ✓ |
| Log workouts | Unlimited | Unlimited |
| Routines | 3 | Unlimited |
| Overload rules | 1 simple | Your own |
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
