# Process

14. **Before calling a task done**, run `npx tsc --noEmit`, `npx expo lint` and the Jest suite (once it exists). Run Maestro flows (once they exist) when you touch a user flow.
15. **Follow the roadmap gates** in `docs/roadmap.md`. Don't build later-phase work early.
16. **Commit only when asked.** Never push, force-push or rewrite history unless asked.
17. **Update `docs/` in the same change** when you alter behavior a doc describes.
18. **Never commit secrets or signing files**: `.env`, `.jks`, `.p8`, `.p12`, `.mobileprovision`.
19. **Start unrelated features on a fresh branch from `main`.** When asked for a feature that isn't part of the current feature branch, run `git checkout main && git pull`, then create the new branch from the updated `main`. Never stack unrelated work on the current branch. If the working tree has uncommitted changes, ask before switching.
