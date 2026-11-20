# Screens

All screens are designed on the [design canvas](https://claude.ai/artifact/Ny2LFGjeieuBmcCGHeGb7e), grouped into rows by flow. Each frame is 390 × 844.

## 1 · Onboarding
| Screen | Notes |
|---|---|
| Welcome | Start, or "I already have Increment" → Welcome back |
| Goal | Strength, muscle, general fitness… |
| Experience | Beginner / intermediate / advanced |
| Schedule | Training days per week |
| Equipment | Full gym, home, dumbbells only… |
| Units | kg or lb |
| Your plan | Generated starter split |
| Reminders | Notification permission, asked here |
| Quick start | Defaults for people who skip |
| Welcome back | Restore Pro purchase and a backup file |

## 2 · Train
| Screen | Notes |
|---|---|
| Today | Date line ("Thursday, 12 Nov") above the title, then the week strip (Sun to Sat, day name over date number: today filled accent, a day with a finished workout tinted accent, a dot = planned and not done; not tappable, no "missed" styling) and a swipeable deck of accent "hero" cards, one per Routine planned today: caption (TODAY), the Routine name in large type, "N exercises" and a white Start workout pill. Swipe the top card sideways to send it to the back and see the next; dots and "1 of 2 · swipe" show under the deck, and a single card is a plain card with no deck or swipe. Routines still to do come first, in Routines-tab order, then Done ones. A finished Routine is a white card with a Done check (FINISHED), the Routine in progress is a white card reading In progress (RUNNING), neither has a button. Under the dots row, a "Today: <Routine>" header ("N exercises" muted on the right) and a white card with the top Routine's first 3 exercises, Targets and "+ N more" (or "No exercises yet"); it follows the deck when swiped, also for a Done Routine, and has no button. A workout belongs to the day it was started. A round Settings gear at the top right opens Settings |
| Live workout | Set rows prefilled with the Target; read-only Last column; weight and reps typed into plain inputs (no −/+ buttons); fixed set count; ⋯ → Discard workout; Finish → Finish prompt. While a rest runs, a panel is pinned to the bottom: a progress ring with the countdown (m:ss, "rest" under it), a "Next up" line, and -15s, +15s and Skip; it hides at zero and the list scrolls clear of it. There is no unit switch on this screen: weights show in the unit chosen in onboarding or Settings, so one workout is logged in one unit. A weight you type is read in the unit on screen and saved as kg, with the unit recorded when the set is checked. A bodyweight exercise has no weight box and no unit header: its rows are Set, Last (reps only), Reps and the check, the banner reads "Target: 9 reps", a set is checked with reps only and saves weight 0, and weight logged before the bodyweight-or-weighted split is ignored |
| Finish workout | Prompt naming unchecked sets (dropped) and skipped exercises (not a Miss); with no sets done it offers Discard instead |
| Discard workout | Confirmation; deletes the workout and its sets |
| Start while one is in progress | Resume, or discard it and start the new one |
| Offer (one per screen) | Opens after Finish, one screen per Earned exercise in workout order. Progress bar and "2 of 5", the exercise and its streak, current Target → stepped-up Target, and only two buttons: Go up and Stay. A bodyweight exercise reads in reps ("You earned more reps", "Go up to 9 reps"). A tap saves the answer and opens the next screen; answers are final. Back and swipe are disabled. Skipped when nothing is Earned |
| Workout summary | Opens after the last Offer (or straight after Finish). Duration, sets, volume (total reps when 0 kg); one card per exercise with outcome, a one-line reason and the next Target ("9 reps" for a bodyweight exercise). Reports only: no Go up or Stay, no records. Done returns to where the workout started |
| Today, no routine | Date line, title "Today" and the strip. A white card with a lavender dumbbell tile, "No routine yet", "Build your own in a minute." and a full-width accent "Create a routine" button (plus icon) that opens New routine |
| Today, rest day | Date line and the title "Rest day", with today outlined in the strip. A lavender banner with an accent moon circle, "Recover today" and a body line: "N of M workouts done this week. Muscles grow while you rest." (M = Routine-days planned this week, N = finished workouts started this week), "N workouts done this week." when N is above M (or M is 0), just "Muscles grow while you rest." when N is 0. Then "Next: Push" with the weekday ("Thursday") on the right, and a white card with the Next Routine's first 3 exercises (tile icon, name, Target as weight and unit, or reps for bodyweight) and "+ N more", or "No exercises yet". No Start button. |
| Today, no days set | Routines exist but none has days. Title "Today" and the strip, then a white card with a lavender calendar tile, "No training days set", "Pick the days you train and Today will plan your week." and a Plan your week button that opens the Routines tab |

## 3 · Routines
| Screen | Notes |
|---|---|
| Routines | List with the free-limit counter |
| New routine | Name and days |
| Add exercises | Pick from the library |
| Edit routine | Start workout, name, days, exercise rows; Reorder; ⋯ → Delete confirmation (no menu step) |
| Edit routine (locked) | While its workout is in progress: edit and delete disabled, Resume workout shown |
| Routines tab, workout in progress | An "in progress" bar above the tab bar (on every tab) reopens the workout |
| Exercise setup | Sheet: sets, reps, rest, rule (read-only until Pro); used to add and to edit; Remove from routine |
| Reorder routine | ▲ ▼ per row; Done saves, Cancel discards |
| Remove exercise | Confirmation |
| Overload rule panel (Pro) | Custom rule with a live preview |
| 2 free routines used | Limit pop-up (no upgrade button in Phase 1; links to the Paywall from Phase 3) |
| Delete routine | Confirmation |

## 4 · Exercise library
| Screen | Notes |
|---|---|
| Library | Search and filters |
| No search results | Message naming what was searched, with a Clear filters button (create shortcut arrives with custom exercises in Phase 3) |
| Exercise detail | How-to; History tab → Exercise history |
| Exercise history | Past sessions and record tags |
| Create custom exercise (Pro) | |
| Edit custom exercise (Pro) | |
| Delete custom exercise (Pro) | Removed from routines, history kept |

## 5 · Progress and Pro
| Screen | Notes |
|---|---|
| Progress | Exercise picker, top set, records; chart preview for free users |
| All records (Pro) | |
| Paywall | 10-row Free/Pro table; Unlock → Pro unlocked |
| Pro unlocked | Confirmation |
| Plate calculator (Pro) | |

## 6 · Settings and data
| Screen | Notes |
|---|---|
| Settings | Interactive kg/lb, and a "Weight jumps" row (no value shown, one Jump per equipment) that opens Weight jumps |
| Weight jumps | Smallest jump for each equipment (Barbell, Dumbbell, Machine, Cable, Bodyweight added weight), with − / + stepping through real plate sizes. Each jump shows in the lifter's unit as the nearest plate step (5 kg is 10 lb), and the note under the card says so. No plates: "Plates at your gym" moves to Phase 3 |
| Your data | Free state: backup locked → Paywall |
| Backup ready | Share sheet for the backup file |
| Automatic backups (Pro) | Frequency, location, files kept |
| Export progress (Pro) | CSV or PDF |
| Delete all data | Typed confirmation |

## Known linking gaps on the canvas
These connections aren't yet wired up on the canvas:
- The Edit button on a custom exercise → Edit custom exercise
- "See all records" on Progress → All records
- The plate calculator button on Live workout → Plate calculator
- New routine → the 2-routine limit pop-up
