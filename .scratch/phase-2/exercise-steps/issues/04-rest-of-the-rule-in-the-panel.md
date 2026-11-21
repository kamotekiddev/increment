# 04: The rest of the rule in the panel

**What to build:** The Overload rule panel also edits the rest of the routine exercise's rule, free for everyone: how it progresses (Weight first, Double progression, Reps only), what happens after misses in a row (keep the weight or drop a percentage), and Deload weeks (off unless turned on). Saving stores the rule; the preview follows every change; the Exercise setup sheet's Progression row describes the saved rule. Free and Pro no longer differ on rules.

**Blocked by:** 03

**Status:** ready-for-agent

- [ ] Each rule type maps to the engine's existing rule (step weight, both, or reps) and saves with the rule's version number
- [ ] The miss rule and Deload weeks save and load; off by default as today
- [ ] The preview reflects the rule type, the step, the miss rule and a due Deload
- [ ] The Progression row text comes from the saved rule (for example "Adds weight after 3 clean workouts")
- [ ] No Pro check remains on rules; the one place that holds Pro limits no longer lists rules
- [ ] Jest: each rule type's next Target from the same history; a miss rule that drops 10%; a Deload due after N weeks
- [ ] Type check, lint and tests pass
