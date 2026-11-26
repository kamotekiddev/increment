# 02: Backup file: build and check

**What to build:** A tested module with no screen. It turns the lifter's data into a `.increment` JSON backup and reads one back, refusing anything it can't trust. This is the one place that knows the file format.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The file has a `format_version` (1) and holds routines, custom exercises, finished workouts with their exercises and sets, and settings; every set carries its weight and unit.
- [ ] The file never holds the Pro entitlement, the Last backup date or a Workout in progress.
- [ ] Building then reading a file gives the same data back; a kg set and a lb set keep their units.
- [ ] A newer format version, a file that isn't a backup, a cut-off file and a row pointing at something missing are each refused with their own plain message, and nothing is changed.
- [ ] A hand-edited `is_pro` in a file has no effect.
- [ ] The counts for the Backup ready and restore preview screens come from the same module.
- [ ] Type check, lint and tests pass.
