# 05: One Offer per screen after Finish

**What to build:** Move the Offer off the summary and onto its own screens between Finish and the summary. Each Earned exercise gets one full screen, in workout order, with a progress bar and count, the current Target → stepped-up Target, and only two buttons: Go up and Stay. A tap saves the answer and opens the next Offer, or the summary after the last. When nothing is Earned, Finish goes straight to the summary. The summary only reports. Design: the Offer frames on the design canvas (Train row).

**Blocked by:** 03 (the inline Offer it replaces)

**Status:** built; checked by tsc, lint and Jest only

- [x] The builder lists the Offers in workout order with Workout exercise id, name, streak, current Target and stepped-up Target; tests cover none, one, several, accepted, declined, and a Deload workout
- [x] The Earned-and-stayed card line reads "Staying at X. The offer comes back after your next clean workout."
- [x] Finish opens the first Offer screen when there is at least one Offer, otherwise the summary
- [x] Each Offer screen shows the progress bar, "N of M", the exercise, its streak, and the change from the current to the stepped-up Target
- [x] Go up and Stay are the only buttons; Go up writes `progress_accepted = true`, Stay writes `false`, and either opens the next screen
- [x] Answers are final once tapped
- [x] Back, swipe and the Android back button do nothing on an Offer screen
- [x] After the last Offer the summary opens, with next Targets that reflect the answers and no Offer buttons
- [x] Killing the app mid-flow reopens the normal tab; answers already tapped are saved and the rest count as Stay
- [x] Engine unchanged; type check, lint and tests pass
