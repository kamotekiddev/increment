# 05: Edit a custom exercise

**What to build:** A Pro lifter can change a custom exercise they made, and a free lifter is sent to the Paywall.

**Blocked by:** 01, 03

**Status:** built

- [x] Exercise detail shows an Edit button for a custom exercise only (never for a library exercise). It opens the Edit screen from the updated canvas with the same fields as Create, filled in.
- [x] Name rules apply, and keeping its own name is not a clash.
- [x] Once the exercise is in a routine or has a logged set, the Bodyweight chip can't be switched on or off, with the note "Bodyweight can't be switched once the exercise is used." Other equipment switches stay open. Before use, all six chips are open. The rule is a pure function with tests, and the load type follows the equipment on save.
- [x] Edits show on Exercise detail, the routines and the live workout without a restart.
- [x] A free lifter can open Edit and change the fields, but the bottom button is **Unlock Pro** in place of Save changes and opens the Paywall; nothing is saved. Delete exercise stays available.
- [x] Type check, lint and tests pass.
