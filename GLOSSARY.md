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
The smallest amount of weight added in one step of progression. It is one value, in the lifter's unit.
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
