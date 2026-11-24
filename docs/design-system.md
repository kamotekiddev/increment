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
| accent-tint-line | `#E2DAFF` | A divider on the accent tint (the Paywall table's Pro column) |
| accent-layer-1 | `#9D8BF9` | Second card in the Today deck, under the top card |
| accent-layer-2 | `#CEC5FC` | Third card in the Today deck |
| danger | `#C62828` | Destructive actions |
| danger-tint | `#FDECEC` | Icon circle on the delete and remove sheets |
| line-strong | `#C9C9CC` | Dashed outline of an empty state |

Other accent shades explored: `#7C3AED`, `#6D28D9`, `#9333EA`. A dark theme is defined in the design system's `tokens.json`.

## Opacity
| Token | Value | Use |
|---|---|---|
| `opacity.pressed` | 0.85 | A filled control while pressed |
| `opacity.disabled` | 0.4 | Any disabled or unavailable control or row (one value everywhere) |

## Radius
`radius` in `src/theme` holds the corner radii. `radius.card` (26) is a list card; `radius.hero` (30) is the larger card of an empty state or a hero (Progress).

## Type
- **Sora** for everything. Large numbers (weights, reps) use heavy weights with tight tracking.

Line heights that a component sets itself come from `lineHeight` in `src/theme` (`lineHeight.title` = 24, for the title-size header glyph; `lineHeight.body` = 21 for a paragraph at body size; `lineHeight.small` = 19 for a note at small size; `lineHeight.screenHeader` = 30 for the large title of an in-page screen header; `lineHeight.action` = 22 for an empty state's heading; `lineHeight.label` = 20 for a row's main line at label size; `lineHeight.subtitle` = 18 for a muted subtitle or month title at small size; `lineHeight.detail` = 17 for a detail line at caption size; `lineHeight.caption` = 16 for a chip's text; `lineHeight.sheetTitle` = 26 for a bottom sheet's title). Tracking a component sets itself comes from `letterSpacing` (`letterSpacing.value` = -0.3, for a weight shown as a value). A bottom sheet's title (the Exercise setup sheet, the Overload rule panel) is the `title` text variant with `textStyle.sheetTitle` (line height 26, tracking -0.4).

## Components
- **Button**: pill-shaped; the primary uses the accent fill, the secondary is white, `danger` is the red destructive action and `dashed` is the outlined "add" action. `large` stretches it to full width at 56 pt (the main action of a screen).
- **Round button**: 48 pt white circle with an icon (back, close, more); accent-filled for add.
- **Set row**: set number, previous set, weight, reps and a done check. The overload target appears in `ink-muted` so it's visible at a glance.
- **Overload badge**: describes a routine exercise's overload rule.
- **Routine hero card** (Today): an accent card with a caption, the Routine name in large type, the exercise count and a white Start pill. With two or more Routines the cards form a deck: lighter layers peek out below, dragging the top card tilts it and reveals the next card's content, and releasing past the swipe distance sends it to the back. Done and In progress cards are white.
- **Tab bar**: a floating white pill; the active tab is an accent pill. Tabs: Today, Routines, Library, Progress.
- **Bottom sheet**: `bg` colour (not white), with rounded top corners, over a dimmed backdrop. Used for pop-ups, confirmations and pickers. Its React Native content sits in an `RNHostView` (never a `Host`) inside the native sheet.
- **Routine screens**: in-page headers with round buttons instead of the native header, white cards on `bg`, and the main action fixed at the bottom. Sizes come from `size` in `src/theme`.
- **Settings rows and the Default rest − / +**: sizes come from `size` too (`size.settingsRow`, `size.stepper`, `size.stepperValue`); the 36 pt − / + reach 44 pt with hitSlop.
- **History rows**: a History row is at least `size.historyRow` (64 pt) tall.
- **Radio cards** (the Overload rule panel's rule types): a `size.radio` (22 pt) circle at the end of the card, accent-filled with a `size.radioDot` (8 pt) white dot when selected.
- **Paywall and Pro unlocked**: both are modal screens. The Paywall's Free/Pro table is a white card whose Pro column sits on the accent tint, divided by `accent-tint-line`. Its main button is 56 pt like a large Button; while a payment is pending it turns accent tint with accent text and a clock. Pro unlocked opens with an accent hero (`size.hero`, `radius.hero`) holding a white check circle inside two faint rings. Their sizes come from `pro` in `src/theme`.
- Touch targets are at least 44 pt.
