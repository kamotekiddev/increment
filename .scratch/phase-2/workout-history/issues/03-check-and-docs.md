# 03: Check and docs

**What to build:** The whole Workout history flow checked on a device, and the docs brought in line with what was built. See `../spec.md`.

**Blocked by:** 01 (History list), 02 (Past workout)

**Status:** ready-for-agent

- [ ] Device check: Progress → History → a row → Past workout → Back → Back; switch Unit in Settings and return (weights follow); finish a workout and return (it appears at the top); empty state on a fresh install; a workout in progress is not listed
- [ ] `docs/screens.md`: Progress row mentions the History pill and that the body arrives with feature 6; Workout history and Past workout rows match what was built
- [ ] `docs/product.md` history line still true (record tags arrive with feature 5)
- [ ] `.scratch/phase-2/map.md`: feature 4 marked built
- [ ] `graphify update .` run
- [ ] `npx tsc --noEmit`, `npx expo lint` and the Jest suite pass
