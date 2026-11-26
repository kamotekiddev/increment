# Increment

An offline gym-logging app that tells a lifter what to do next: when they have earned more weight or reps, and what the new target is.

## Language

**Target**:
The weight and reps the app asks the lifter to hit for one exercise in their next workout.
_Avoid_: Goal, prescription, suggestion

**Overload rule**:
The per-exercise setting that decides how a Target changes once progression is Earned: how much to add, to weight, reps or both.
_Avoid_: Plan, algorithm, progression type

**Jump**:
The smallest amount of weight added in one step of progression ("Add each time"). It is set per Routine exercise, one in kg and one in lb, and is 2.5 kg / 5 lb until the lifter sets it. Progression uses the one for the lifter's current Unit; switching Unit never changes either. Stored as the routine exercise's `step_kg` and `step_lb`.
_Avoid_: Increment (the app's name), step size, plate

**Rep range**:
The minimum and maximum reps planned for each working set of an exercise.
_Avoid_: Rep target (a Target is a specific number inside the range)

**Working set**:
A set that counts toward progression. Warm-up sets and sets not marked done are not working sets.
_Avoid_: Normal set, real set

**Streak**:
The number of consecutive workouts in which the lifter hit the Target for an exercise at the same Target. It restarts when the Target changes.
_Avoid_: Run, chain

**Earned**:
The state in which a Streak has reached 3 Clean workouts (fixed), so the app can propose a higher Target. The lifter still chooses whether to accept it.
_Avoid_: Unlocked, due, ready

**Record**:
A best the lifter has reached on one exercise (heaviest set, estimated 1-rep max, most volume; for an exercise with no weight, most reps in a set and most reps in a workout). Always worked out from logged sets, never saved on its own.
_Avoid_: PR, personal best (unless shown to the lifter as a label)

**Top set**:
The heaviest done Working set of one exercise in one workout, with more reps winning a tie. For an exercise with no weight, the set with the most reps. Progress shows the top set of the last workout.
_Avoid_: Best set, main set

**Pro**:
The one-time purchase that unlocks the paid features. It works offline.
_Avoid_: Premium, subscription, paid plan

**Locked routine**:
A Routine past the lifter's 2 oldest (by when it was created, whatever order the list is in) while they don't have Pro, for example after a refund. It can be opened and deleted, but not started or edited, and it is left out of Today and Reminders. Its Workouts and Records stay. Buying or restoring Pro unlocks it, and so can deleting an older Routine. A Workout in progress on it may be finished first. A Routine that can't be edited during a Workout in progress is "blocked by a Workout in progress", not locked.
_Avoid_: Pro routine, paused routine, disabled routine

**Restore purchase**:
Asking the store whether this lifter already bought Pro, for example on a new phone, so it unlocks without paying again. It brings back Pro only, never training data.
_Avoid_: "Restore" on its own (restoring from a backup is a different thing)

**Backup**:
A single `.increment` file holding the lifter's finished Workouts, Routines, Custom exercises and settings, made by a Pro lifter to move to a new phone. It never holds the Pro purchase or a Workout in progress. Restoring one replaces everything training-related on the phone and is free for everyone.
_Avoid_: Export (a CSV or PDF for reading, not for restoring), Restore purchase

**Automatic backup**:
A Backup the app makes by itself for a Pro lifter, into one folder, on a schedule they chose: after every workout, daily, weekly or monthly. Daily, weekly and monthly ones are made only when the data has changed since the last Backup. The app keeps the last few automatic backups (3, 5, 10 or 20) and never deletes a Backup the lifter made by hand. A manual Backup and an automatic one share the one Last backup date. Pausing it after a refund keeps its settings and files. They are the only files Files shows on iOS; the database is kept out of that folder.
_Avoid_: Auto-save, sync, cloud backup (it writes to a folder; whether that folder syncs is the lifter's choice)

**Step**:
How a Target rises once progression is Earned: add weight (by the Jump), add reps (by the Rep step), or both. It is set per exercise.
_Avoid_: Progression type, mode

**Offer**:
The question the app asks after a workout once progression is Earned: move up to the stepped-up Target next time? The lifter answers Go up (accepted) or Stay (declined), one exercise at a time. An Offer left unanswered counts as Stay.
_Avoid_: Proposal, suggestion, level up

**Rep step**:
The number of reps added to the Target in one Step (fixed at 1).
_Avoid_: Rep increment

**Clean**:
A workout in which every planned working set reached the Target weight and reps.
_Avoid_: Successful, perfect

**Hold**:
A workout that fell short of the Target but kept every planned working set inside the rep range. It keeps the Target and restarts the Streak.
_Avoid_: Partial, near miss

**Miss**:
A workout in which a working set fell below the bottom of the rep range, or fewer sets were done than planned.
_Avoid_: Fail, failure

**Deload**:
A deliberately lighter workout, scheduled every N weeks when the lifter turns it on. It never counts as a Miss or toward a Streak.
_Avoid_: Recovery week, reset

**Load type**:
Whether an exercise progresses by weight or by reps only: weighted or bodyweight. An exercise done both with and without added weight is two exercises (for example Pull-up and Weighted pull-up). A Custom exercise gets it from its equipment: Bodyweight is bodyweight, anything else is weighted.
_Avoid_: Exercise type, category

**Custom exercise**:
An exercise the lifter made themselves (Pro), with a name, one main muscle group, equipment and optional how-to steps. Its name can't match any library exercise or another Custom exercise. Deleting it removes it from every Routine and deletes all its Workout exercises, sets and Records for good.
_Avoid_: User exercise, own exercise

**Workout exercise**:
One exercise within one workout, holding the Target that was shown and whether the lifter accepted the offered Step.
_Avoid_: Session, entry

**Routine**:
A named workout the lifter repeats, with an ordered list of exercises and the days of the week it is planned for. Its name is unique among the lifter's routines. Each exercise in it can appear once.
_Avoid_: Plan, program, split, template

**Routine exercise**:
One exercise within a Routine, holding its planned sets, Rep range, rest length, Overload rule and Jump. A Streak and a Target belong to a Routine exercise, so the same exercise in two Routines progresses separately.
_Avoid_: Slot, entry

**Default rest**:
The Rest length a Routine exercise starts with when it is added to a Routine. The lifter sets it in Settings. Changing it never changes an exercise already in a Routine.
_Avoid_: Global rest, rest setting

**Rest length**:
The seconds the lifter plans to rest between sets of a Routine exercise.
_Avoid_: Rest timer (that counts down during a workout)

**Rest timer**:
The countdown that starts when the lifter marks a set done, from that Routine exercise's Rest length. There is only one at a time, and a new one replaces a running one. It does not start after the last open set of the Workout. Skipping it ends it like running out does, moving on to the next exercise with open sets when this one is finished, but without a buzz.
_Avoid_: Rest clock, break timer

**Workout**:
One session of training started from a Routine. It holds a Workout exercise for each exercise in the Routine as it was when the Workout started.
_Avoid_: Session, log

**Workout in progress**:
A Workout that has been started and not yet finished or discarded. Only one can exist at a time, and while it exists its Routine cannot be edited or deleted.
_Avoid_: Active workout, open workout, draft

**Current set**:
The first set of the exercise on screen that is not done. It is highlighted on the live workout, and no set is current once every set of the exercise is done.
_Avoid_: Active set, next set

**Skipped exercise**:
An exercise in a Workout with no sets done. It is left out of the saved Workout and is neither a Miss nor a Clean, so its Streak and Target stay as they were.
_Avoid_: Missed exercise, dropped exercise

**Rest day**:
A day of the week on which no Routine is planned. Today shows a rest-day message instead of Routine cards.
_Avoid_: Off day, day off

**Reminder**:
A local notification, at one time the lifter picks, on a day of the week on which at least one Routine is planned, never on a Rest day. The days follow the Routines' days, so changing a Routine's days changes the Reminder days. A day on which a Workout has already been started gets no Reminder.
_Avoid_: Alert, nudge, Rest timer notification

**Workout history**:
The list of the lifter's finished Workouts, newest first. Each one opens to its Workout exercises and their done Working sets in the lifter's Unit. A Workout in progress is not in it.
_Avoid_: Log, session history, Exercise history

**Unit**:
The weight system the lifter has chosen to see and type weights in, kg or lb. One global choice. It changes only what is shown and read; a set keeps the number and unit it was typed in, and switching never changes a stored set.
_Avoid_: Measurement system, weight mode
