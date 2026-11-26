# 06: Docs and phone check

**What to build:** Docs match the build and the owner checks it on phones.

**Blocked by:** 03, 04, 05

**Status:** ready-for-agent

- [x] `docs/decisions.md`, `docs/screens.md`, `docs/product.md`, `docs/architecture.md`, `GLOSSARY.md` and the Phase 3 map say built.
- [ ] Phone check (Android): the picked folder is still writable after an app restart; a failed folder alerts once; Keep prunes only auto files.
- [ ] Phone check (iOS): the file appears in Files › On My iPhone › Increment.
- [ ] Phone check (iOS): on a phone with an older build installed, update and open the app: workouts are all still there, and Files › On My iPhone › Increment shows no `SQLite` folder or database, only backup files.
