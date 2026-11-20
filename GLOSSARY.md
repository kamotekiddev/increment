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
The smallest amount of weight added in one step of progression. It is set per equipment (for example barbell or dumbbell). In the other unit it shows as the nearest real step.
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
The state in which a Streak has reached the number of sessions the lifter set, so the app can propose a higher Target. The lifter still chooses whether to accept it.
_Avoid_: Unlocked, due, ready

**Record**:
A best the lifter has reached (heaviest set, estimated 1-rep max, most volume). Always worked out from logged sets, never saved on its own.
_Avoid_: PR, personal best (unless shown to the lifter as a label)

**Pro**:
The one-time purchase that unlocks the paid features. It works offline.
_Avoid_: Premium, subscription, paid plan

**Step**:
How a Target rises once progression is Earned: add weight (by the Jump), add reps (by the Rep step), or both. It is set per exercise.
_Avoid_: Progression type, mode

**Offer**:
The question the app asks after a workout once progression is Earned: move up to the stepped-up Target next time? The lifter answers Go up (accepted) or Stay (declined), one exercise at a time. An Offer left unanswered counts as Stay.
_Avoid_: Proposal, suggestion, level up

**Rep step**:
The number of reps added to the Target in one Step (1 to 3).
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
Whether an exercise progresses by weight or by reps only: weighted or bodyweight. An exercise done both with and without added weight is two exercises (for example Pull-up and Weighted pull-up).
_Avoid_: Exercise type, category

**Workout exercise**:
One exercise within one workout, holding the Target that was shown and whether the lifter accepted the offered Step.
_Avoid_: Session, entry

**Routine**:
A named workout the lifter repeats, with an ordered list of exercises and the days of the week it is planned for. Its name is unique among the lifter's routines. Each exercise in it can appear once.
_Avoid_: Plan, program, split, template

**Routine exercise**:
One exercise within a Routine, holding its planned sets, Rep range, rest length and Overload rule. A Streak and a Target belong to a Routine exercise, so the same exercise in two Routines progresses separately.
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

**Unit**:
The weight system the lifter has chosen to see and type weights in, kg or lb. One global choice. It changes only what is shown and read; every weight is stored in kg.
_Avoid_: Measurement system, weight mode
