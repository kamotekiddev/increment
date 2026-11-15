# 07: Docs, glossary and ADR

**What to build:** The project's docs say what we decided, so the next person does not have to guess: weights stored in kg get an ADR; the glossary has every term used in the spec; the rule, architecture, product, roadmap and decisions docs match the engine and schema as built.

**Blocked by:** 01, 02, 03

**Status:** ready-for-agent

- [ ] An ADR records "weights stored in kg as full-precision numbers with the entered unit"
- [ ] The glossary adds: Streak (already there), Step, Rep step, Clean, Hold, Miss, Deload, Load type, Workout exercise
- [ ] The data rules say rounding is to the Jump only, and that Targets and acceptances are stored while Records stay derived
- [ ] Architecture shows the workout exercises table, the load type, the deload flag on workout exercises and plates out of settings
- [ ] Product says the free rule comes from the exercise's load type
- [ ] The roadmap wording for plates matches (plates inventory and calculator are not in the engine)
- [ ] The decisions doc records the library source
