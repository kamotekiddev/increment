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
| Today | Week strip, today's session, settings gear |
| Live workout | Set rows prefilled with the Target; read-only Last column; fixed set count; ⋯ → Discard workout; Finish → Finish prompt. Interactive kg/lb arrives in Phase 2 |
| Finish workout | Prompt naming unchecked sets (dropped) and skipped exercises (not a Miss); with no sets done it offers Discard instead |
| Discard workout | Confirmation; deletes the workout and its sets |
| Start while one is in progress | Resume, or discard it and start the new one |
| Workout summary | Volume, records, what goes up next time |
| Today, no routine | Empty state |
| Today, rest day | Rest-day state |

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
| Settings | Interactive kg/lb |
| Weight jumps | Smallest jump by equipment, and your gym's plates |
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
