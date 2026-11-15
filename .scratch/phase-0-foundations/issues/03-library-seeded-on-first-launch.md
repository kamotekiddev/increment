# 03: Library seeded on first launch

**What to build:** The first time the app opens, the exercise library is already inside it: a curated set of roughly 150–250 common lifts, each with muscles, equipment, text instructions and a load type (weighted, bodyweight, or bodyweight or weighted). Opening the app again never duplicates it.

**Blocked by:** 02

**Status:** ready-for-agent

- [ ] The license of free-exercise-db is read from its own repository and confirmed to allow commercial use before any data is imported
- [ ] The curated list is shown to the owner for review before it is seeded
- [ ] Every exercise has a unique stable id, a unique name, equipment, non-empty instructions and a valid load type
- [ ] A Jest test checks all of the above over the curated data
- [ ] The library is inserted on first launch only, and a second launch adds nothing
- [ ] The library source is recorded in the decisions doc
- [ ] The count of seeded exercises is correct on device (owner checks)
