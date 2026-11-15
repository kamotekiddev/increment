# Design system

The full system lives at https://claude.ai/artifact/2eEe2GhySr9xx6LqTbmGhs. This is the summary the app's theme file is built from.

## Principles
- **Neutral base, purple accent.** White cards on a warm off-white. Near-black is used for text only, never for big blocks.
- **One loud block per screen.** At most one accent-filled area, usually the main action.
- **Progress uses the accent tint.** Records, targets and increases appear as accent-tint pills.
- Minimal and modern: pill buttons, a floating tab bar, and bottom sheets over a dimmed backdrop.

## Color (light theme)
| Token | Hex | Use |
|---|---|---|
| bg | `#F4F4F2` | App background |
| card | `#FFFFFF` | Cards, sheets |
| sunk | `#EFEFEC` | Inputs, inset areas |
| line | `#E6E6E3` | Dividers, borders |
| ink | `#111113` | Primary text |
| ink-soft | `#3A3A3F` | Secondary text |
| ink-muted | `#6B6B70` | Labels, hints |
| icon-faint | `#85858B` | Inactive icons |
| accent | `#5B3DF5` | Actions, active tab, progress |
| accent-tint | `#EFEAFF` | Progress pills, highlights (alias: `pr`) |
| danger | `#C62828` | Destructive actions |

Other accent shades explored: `#7C3AED`, `#6D28D9`, `#9333EA`. A dark theme is defined in the design system's `tokens.json`.

## Type
- **Sora** for everything. Large numbers (weights, reps) use heavy weights with tight tracking.

## Components
- **Button**: pill-shaped; the primary uses the accent fill, the secondary a white or outline style.
- **Set row**: set number, previous set, weight, reps and a done check. The overload target appears in `ink-muted` so it's visible at a glance.
- **Overload badge**: describes a routine exercise's overload rule.
- **Tab bar**: a floating white pill; the active tab is an accent pill. Tabs: Today, Routines, Library, Progress.
- **Bottom sheet**: white, with rounded top corners, over a dimmed backdrop. Used for pop-ups, confirmations and pickers.
- Touch targets are at least 44 pt.
