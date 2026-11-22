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
| Live workout | Set rows prefilled with the Target; read-only Last column (hidden when Show previous set is off, the weight and reps boxes then share its width); the screen is held awake while the live workout is open when Keep screen awake is on, and released on Finish, Discard or leaving; weight and reps typed into plain inputs (no −/+ buttons); fixed set count; ⋯ → Discard workout; Finish → Finish prompt. While a rest runs, a panel is pinned to the bottom: a progress ring with the countdown (m:ss, "rest" under it), a "Next up" line, and -15s, +15s and Skip; it hides at zero and the list scrolls clear of it. There is no unit switch on this screen: weights show in the unit chosen in onboarding or Settings, so one workout is logged in one unit. A weight you type is saved exactly as typed, with the unit on screen ("62,5" is 62.5). Prefilled rows are the Target in the current unit. After a unit change in Settings, a row not yet typed or checked shows in the new unit, rounded down to the Jump, and typed or checked rows keep their saved weight (converted on screen). The Last column shows a past set exactly in its own unit, or rounded down to the Jump when it was logged in the other unit (100 kg shows as 220 in lb, 62.5 kg as 135). A bodyweight exercise has no weight box and no unit header: its rows are Set, Last (reps only), Reps and the check, the banner reads "Target: 9 reps", a set is checked with reps only and saves weight 0, and weight logged before the bodyweight-or-weighted split is ignored |
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
| Exercise setup | Sheet: sets, reps, rest and a Progression row describing the rule ("Adds weight after 3 clean workouts", "Adds weight and reps …" for Double progression; no Pro badge), the rule saved in the panel once Save rule is tapped; tapping it opens the Overload rule panel in the same sheet. Used to add and to edit; the primary button (Add to routine / Save) saves the setup with any step and rule saved in the panel; Remove from routine |
| Reorder routine | ▲ ▼ per row; Done saves, Cancel discards |
| Remove exercise | Confirmation |
| Overload rule panel | Free for everyone, no Pro badge. How it progresses: three radio cards, Weight first ("Add weight when every set hits the Target", the engine's weight step), Double progression ("Add weight and a rep each step", both) and Reps only ("Add a rep each step, keep the weight", reps). "Add each time" offers the current unit's plate steps (kg 0.5, 1, 1.25, 2, 2.5, 5, 10; lb 1.25, 2.5, 5, 10, 15, 20) with the saved step, or 2.5 kg / 5 lb, selected. "If you miss twice in a row": Keep the weight (no miss rule, the default) or Drop 10%. A Deload weeks switch, off by default: "Every 6 weeks, one workout at 60%". These controls scroll when the sheet is taller than the screen; there is no Rep range row (it is on the setup sheet). A bodyweight exercise shows only the preview and Save rule. A live preview from the engine follows every change: "Next session: 62.5 kg × 6–8. Hit 8 on every set and it becomes 65 kg." (it counts the clean workouts already in a row with the engine's Streak, as Start does: "Hit 8 on every set 3 workouts in a row and it becomes 62.5 kg." with none yet, "2 more workouts" after one, "1 more workout" after two, and once Earned "Next session: 60 kg × 6–8. You've earned 62.5 kg; it's offered at Start."; "65 kg × 9" for Double progression), then " Miss twice in a row and it drops to 55 kg." and " Every 6 weeks, one Deload workout at 60%." when those are on; a due Deload reads "Deload next session: 37.5 kg × 6–8. It does not count toward your Streak."; with no past workout "Your first session sets the starting weight. Each step adds 2 kg." ("2.5 kg and 1 rep" for Double progression). Save rule stages that unit's step only (the other unit's is untouched; a bodyweight exercise, which has no "Add each time", stages none, so both stay empty) and the rule, and returns to the setup; Close returns without them. Targets use the new rule and step from the next Start |
| 2 free routines used | Limit pop-up (no upgrade button in Phase 1; links to the Paywall from Phase 3) |
| Delete routine | Confirmation |

## 4 · Exercise library
| Screen | Notes |
|---|---|
| Library | Search and filters |
| No search results | Message naming what was searched, with a Clear filters button (create shortcut arrives with custom exercises in Phase 3) |
| Exercise detail | How-to only (no History tab; history is per Workout, see Workout history) |
| Create custom exercise (Pro) | |
| Edit custom exercise (Pro) | |
| Delete custom exercise (Pro) | Removed from routines, history kept |

## 5 · Progress and Pro
| Screen | Notes |
|---|---|
| Progress | Title "Progress" with a white History pill on the right (history icon, "History") that opens Workout history. The pill is there before records so it never moves. Until Phase 2 feature 6 the tab shows only the title row and the muted line "Your records will appear here."; the designed body below arrives with it (owner decision 2026-11-22). Records belong to one exercise at a time. Under the title is an exercise picker (white pill, equipment icon, the exercise name, a chevron). Then a white hero card: "Top set, last workout" with the top set big ("62.5 × 8 kg", "10 reps" for a bodyweight exercise), an accent "New record" pill when that workout set a record, a muted line ("Thu, 12 Nov · up 2.5 kg since 29 Oct"), and a blurred chart preview with a "Charts come with Pro" chip (charts are Pro; the free tier gets the preview only). Then one white Records card with a rows list: Heaviest set ("62.5 × 8"), Estimated 1-rep max ("79 kg") and Most volume ("1,920 kg", the best single workout), each with a trophy / trend / bars icon, its date and a small accent "New" pill when the last workout set it (its icon sits on an accent tint then). The card ends with a "See all records" row with a grey Pro tag. The weight / est. max / volume toggle, the "Last 8" dropdown and the two stat tiles of the first design are gone for free users |
| Progress, no workout yet | The exercise has no finished workout. The picker stays. A white card with a lavender trophy circle, "Your first record is one workout away" and "Finish a workout with <exercise> and your heaviest set, estimated 1-rep max and most volume show up here." Under it the Records card with the three rows greyed and "– – –" in place of values, no chart and no "See all records" row |
| Progress, bodyweight exercise | An exercise with no weight (Pull-up). The hero shows the top set in reps ("10 reps"). The Records card has two rows instead of three: "Most reps in a set" ("10 reps") and "Most reps in a workout" ("28 reps"); no Heaviest set and no Estimated 1-rep max. Same "New" pill, chart preview and "See all records" row |
| Workout history | From the History pill on Progress. A back button (returns to Progress) and the title "History". Every finished Workout across all Routines, newest first by start time (two on one day keep their order); a workout in progress is not listed. Month headers carry the year ("November 2026"); each month's rows sit in one white card with dividers. A row reads the date ("Thu, 12 Nov") with the Routine's current name muted beside it ("Workout" when it has none), "5 exercises · 48 min" under it (skipped exercises and exercises with only warm-ups done not counted), and a chevron; it opens Past workout. A Workout belongs to the day it was started. Duration is finish minus start, floored, as on the Workout summary: "48 min", "1 h", "1 h 12 min", no cap. The whole list scrolls, no paging. It reloads on return, so a Workout just finished shows at the top. Empty: a white card with the history icon in a lavender circle, "No workouts yet" and "Finish a workout and it shows up here.", no button. Read-only, free |
| Past workout | One finished Workout, read-only. A back button (returns to History), the Routine name as title and "Thu, 12 Nov · 48 min" under it. The exercises with a done Working set are rows with dividers inside one white card, in the workout's order: the exercise name with its Target muted beside it ("Target 62.5 × 8", "Target 10 reps" for a bodyweight exercise, none on an exercise's first workout), a grey Deload pill at the right end of the name row when it was a Deload, and under it one grey chip per done Working set in set order ("62.5 × 8", "9 reps" with no weight; warm-ups and unchecked sets left out; added weight logged on a bodyweight exercise stays, "10 × 8"). Targets and chips show in the current unit and are never snapped to the Jump grid: one saved in the current unit shows exactly ("45 × 10"), one saved in the other unit is converted to one decimal with "≈" ("≈20.4 × 10" for 45 lb in kg, "Target ≈137.8 × 8" for 62.5 kg in lb), ADR 0003. They follow a unit switch on return. No Clean / Hold / Miss label, no records (record pills arrive with feature 5), no edit or delete. An unknown or in-progress Workout shows an empty screen; Back still works |
| All records (Pro) | |
| Paywall | 9-row Free/Pro table; Unlock → Pro unlocked |
| Pro unlocked | Confirmation |
| Plate calculator (Pro) | |

## 6 · Settings and data
| Screen | Notes |
|---|---|
| Settings | Interactive kg/lb with a note (tapping the unit that is not selected opens a confirmation sheet, swap icon, "Switch to pounds?" / "Switch to kilograms?", saying what changes: weights about to be lifted show in the new unit rounded down to each exercise's step, so every converted weight is one the lifter can still load (that phrase is set in bold) (62.5 kg becomes 135 lb, 135 lb becomes 60 kg), logged sets stay as typed, and with a workout in progress its untouched sets switch too; "Switch to pounds" / "Switch to kilograms" saves and closes, Cancel or swiping down saves nothing; tapping the selected unit does nothing), and a Workout card: Default rest (inline − / + stepper, 15 s steps from 0:15 to 10:00), Show previous set (switch) and Keep screen awake (switch) |
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
