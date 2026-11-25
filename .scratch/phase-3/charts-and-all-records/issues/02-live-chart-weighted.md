# 02: Pro sees a live chart for a weighted exercise

**What to build:** A Pro lifter's Progress hero card shows the chart (variant A) for a weighted exercise: the Weight / Est. 1RM / Volume toggle above a line with dots, defaulting to Weight and Last 8. A free lifter still sees the blurred preview.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] The records read module returns one point per finished workout for the chosen metric in the current unit, oldest first, using the Phase 2 counted-set rules (tests against an in-memory database: Last 8 returns the latest 8, each metric on known sets, a null Est. 1RM workout skipped, warm-up/unchecked/discarded/in-progress sets never counted, lb and kg compared in kg).
- [x] A pure geometry function turns points into scaled coordinates, y-axis ticks and the line and fill paths, and does not throw on 0 or 1 point or equal values (tests).
- [x] The chart is drawn with `react-native-svg`; Skia only if SVG can't do it.
- [x] A Pro lifter sees the live chart in the hero card and toggles the metric; a free lifter and the dev Pro source switch (Free) see the blurred preview.
- [x] Type check, lint and tests pass.
