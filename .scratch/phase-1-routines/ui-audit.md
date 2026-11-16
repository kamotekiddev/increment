# Routines UI audit against the design canvas

Compared the built screens with the canvas artboards (group 3). The build had been checked only by tsc, lint and Jest, never against the artboards or on a device.

| Screen (artboard) | What differed | Now |
|---|---|---|
| Routines (`Routines`) | Plain heading, text counter, flat rows with a chevron, secondary "New routine" | Large title with a round accent "+", tinted counter card with limit bars, white cards (name, exercise preview, footer with days and count), dashed "New routine" |
| New routine (`RoutineNew`) | Native header, sunk input, 3-letter day chips, Create button inline | In-page header with ✕, white 56 pt name field with accent ring, one-letter day pills, "No exercises yet" card, fixed Create routine button |
| Edit routine (`Routine`) | Native header and ⋯ glyph, flat list, text "Reorder" link, "Add exercises" secondary button | Round back and ⋯ buttons, Start workout first, exercise cards with equipment tiles, Reorder pill, dashed Add exercise, fixed Done |
| Add exercises (`RoutinePick`) | Native header, flat rows, plain "Added" text, no Done | Round back, white pill search, one white card of rows with equipment tiles and a "+" or Added pill, fixed Done |
| Exercise setup (`RoutineSetup`, `RoutineSetupEdit`) | Vertical stepper list, no subtitle or close, plain progression text | Subtitle and ✕, stepper tiles, bordered Progression card with lock and Pro pill, "Set your own rule with Pro.", 56 pt primary, red Remove |
| Reorder (`RoutineReorder`) | ▲ ▼ text glyphs in the native header | Cancel / Reorder / Done header, hint text, cards with tiles and chevron buttons |
| Remove exercise, Delete routine (`RoutineRemove`, `RoutineDelete`) | Left-aligned text, text-only delete link, ⋯ opened a menu first | Centred trash icon on a red tint, red action, Cancel; ⋯ goes straight to the confirmation |
| 2 free routines used (`RoutineLimit`) | Text only | Lock tile, title, limit bars, Got it |

## Deliberate differences from the artboards

- **"Create your own (Pro)" card on Add exercises:** left out. Custom exercises arrive in Phase 3 (`docs/screens.md`).
- **"See Pro" and the Pro benefit list on the limit pop-up:** left out. No paywall or upgrade button before Phase 3 (spec).
- **Reps:** the artboards show one "Reps 8–12" tile. The spec needs separate min and max with their own limits, so the sheet shows four tiles in a 2 × 2 grid. Open question for the owner.
- **Add exercises on New routine:** the artboard shows the button before the routine exists. It now saves the routine first, then opens the picker.
- **Exercise icons:** two icons only, a dumbbell for weighted and a flexed arm for bodyweight (MaterialCommunityIcons), instead of the artboards' drawn per-equipment icons.
- **Bottom fade:** a solid background strip behind the fixed buttons instead of a gradient (no gradient package is installed).

## Still unchecked

Everything above is checked by tsc, lint and Jest only. It needs the device pass in ticket 07 on iPhone and Android, including the bottom sheets (`RNHostView`).
