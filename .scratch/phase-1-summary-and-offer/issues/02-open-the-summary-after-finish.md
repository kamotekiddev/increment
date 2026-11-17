# 02: Open the summary after Finish

**What to build:** After Finish is confirmed, the workout is saved as today and the live screen is replaced by the summary screen: header card, one card per exercise, and Done. Cards show outcome and next Target; no Offer buttons yet. Back, swipe and Done return to where the workout started.

**Blocked by:** 01

**Status:** built; checked by tsc, lint and Jest only

- [x] Finish saves, unlocks the routine and clears the in-progress bar, then shows the summary
- [x] The summary reads the saved workout and the exercise history by routine, and renders the builder's output
- [x] Done, back, swipe and the Android back button all return to where the workout started
- [x] Finish prompts and Discard behave as before
- [x] Follows the design tokens and existing components; type check and lint pass
