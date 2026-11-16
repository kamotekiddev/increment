# Phase 1 · Core training loop: map

Gate (from the roadmap): a full week of your own workouts logged in the app, with every Target correct. Checked by the owner after feature 7.

Phase 1 is split into seven features so work doesn't move as one large spec. Each feature ends with something usable on a phone, gets its own full spec at `.scratch/<feature-slug>/spec.md` when it becomes next (not before), and is built on its own branch from `main`.

## Features, in build order

| # | Feature | Needs first |
|---|---|---|
| 1 | Library browse | Phase 0 |
| 2 | Routines | 1 |
| 3 | Live workout core | 2 |
| 4 | Summary and step offer | 3 |
| 5 | Today | 3 |
| 6 | Rest timer | 3 |
| 7 | Crash resume | 3, 6 |

### 1 · Library browse (built; owner check on phones pending, see its ticket 04)
Search and filter the seeded exercises, and open an exercise detail with how-to text. Read-only. Gives routines a picker to add exercises from.

### 2 · Routines
Create, edit and delete a routine. Add exercises from the library, and set sets, rep range and rest per exercise; the step is shown, not chosen (choosing arrives with Pro in Phase 3). Deleting a routine deletes its workouts, see ADR 0002. Spec: `.scratch/phase-1-routines/spec.md`.

### 3 · Live workout core
Start a routine and log sets. Each exercise shows the free-rule Target from the engine. Finish saves the workout and the Target that was shown. No summary, timer or Today yet; Finish returns to where the workout started. Spec: `.scratch/phase-1-live-workout/spec.md`.

### 4 · Summary and step offer
After Finish, show the workout summary (volume and what goes up next time). When progression is Earned, offer the step: Accept makes it the next Target, Decline leaves the Target unchanged and the offer returns after the next clean workout.

### 5 · Today
Week strip and today's routine with a Start button into the live workout. Includes the empty state (no routines) and the rest-day state.

### 6 · Rest timer
Starts when a set is marked done, using the exercise's rest length. Skip and add-time controls, and a nudge at zero.

### 7 · Crash resume
Reopening the app after it was killed mid-workout returns to the same workout, with logged sets and the rest timer intact.

## Decisions so far
- Split by what the lifter can use on the device, not by screen.
- Library records, exercise history and charts stay in Phases 2 and 3, as in the roadmap.
- A Streak and a Target are per routine exercise, so feature 3 reads history by routine (ADR 0002).
- Full specs are written just in time, one feature at a time.
