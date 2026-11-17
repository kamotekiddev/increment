# 03: Accept and decline the Offer

**What to build:** When progression is Earned, the exercise card shows the Offer with Accept and Decline. Tapping either saves `progress_accepted` on that Workout exercise at once and updates the card's next Target. The lifter can flip the answer until they leave; leaving without answering counts as Decline.

**Blocked by:** 02

**Status:** built; checked by tsc, lint and Jest only

- [x] The Offer shows the proposed Target, only when the engine returns a proposal
- [x] Accept writes `progress_accepted = true` immediately and the card shows the stepped-up Target
- [x] Decline (or tapping it after Accept) writes `false` and the card shows the current Target
- [x] Leaving without answering leaves `progress_accepted` false and never blocks Done
- [x] After leaving, the answer cannot be changed (the summary cannot be reopened)
- [x] The next workout of that routine exercise shows the stepped-up Target after Accept, and the current one after Decline
- [x] Type check, lint and tests pass
