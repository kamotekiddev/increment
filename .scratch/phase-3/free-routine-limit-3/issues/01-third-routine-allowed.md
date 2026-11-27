# 01: The 3rd routine is allowed and the 4th hits the pop-up

**What to build:** A free lifter can create a 3rd routine. Trying to create a 4th shows the limit pop-up, now "You've used your 3 free routines", with See Pro and Not now as before. The Paywall's Routines row and the gallery line read 3. The free limit is the one `FREE_ROUTINE_LIMIT` constant set to 3, and this copy is built from it, not typed (product rule 7). Spec: `../spec.md` (owner decision 2026-11-27).

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] The constant is 3. Without Pro, creating a routine is allowed with 0, 1 or 2 routines and blocked with 3 or more; with Pro it is always allowed.
- [ ] The limit pop-up title reads "You've used your 3 free routines" and its buttons and Paywall pitch are unchanged.
- [ ] The Paywall's Routines row reads 3 against "Unlimited", and the gallery line says 3.
- [ ] Each of these strings is built from the constant. Tests check the create rule and that the pop-up title and Paywall row contain the constant's value.
- [ ] `npx tsc --noEmit`, `npx expo lint` and the Jest suite pass.

## Comments
