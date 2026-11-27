# 04: Delete all data

**What to build:** The red Delete all data link on Your data opens a sheet with the counts, the Pro-only "Create a backup first" shortcut, and the typed DELETE confirmation. It is blocked, before typing, while a Workout is in progress. Confirming deletes training data, resets preferences to defaults, cancels reminders, switches automatic backups off and clears Last backup, then lands on Your data with zeros, "No backup yet" and "All your data was deleted."

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] The Pro entitlement, library exercises, `seed_version` and saved backup files are untouched.
- [ ] A Workout in progress shows "Finish or discard your workout first." and changes nothing.
- [ ] A free lifter doesn't see the backup shortcut; a Pro lifter's shortcut opens the Backup flow and returns to Your data.
- [ ] Unit tests for the delete (seam 2) and the shortcut gate (seam 3); type check, lint and tests pass.
