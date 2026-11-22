# 01: Progress shows the last workout and the Records for the default exercise

**What to build:** The Progress tab opens on the lifter's most recently done exercise and shows its hero card and Records card, as on the `Progress` board. A new Progress read module works out the top set of the last finished workout, the muted line comparing it with the workout before (`up 2.5 kg since 29 Oct`, `down …`, `same as 29 Oct`, `up 2 reps since 29 Oct`, `first workout`), the "New record" and per-record "New" flags (from the records module's tags for the last workout, so a first workout shows none) and the current Records with their dates. The default exercise is the most recently done one, else the first routine exercise. The screen shows the hero with the blurred chart preview and chip (not tappable yet) and the Records card (Heaviest set as History shows it, 1-rep max and volume as whole numbers) in the lifter's unit, with "≈" and one decimal for a set logged in the other unit. The History pill stays. See `../spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [x] Top set: heaviest weight, more reps wins a tie; warm-up, unchecked, discarded and open sets never count
- [x] Hero line cases: up, down (a Deload is not special-cased), same, reps only, first workout; a set from the other unit is compared in kg and shown with "≈"
- [x] "New record" and "New" come from the last workout's record tags; a first workout shows none; an equal workout shows none
- [x] Default exercise: most recently done, else first routine exercise
- [x] Hero and Records card match the `Progress` board for a weighted exercise
- [x] Tests at the Progress read module against an in-memory database cover the cases in `../spec.md`
- [x] Type check, lint and tests pass
