# Code conventions

9. **Check the Expo docs for the installed SDK** before touching an Expo or React Native API. Never answer from memory.
10. **Add packages with `npx expo install`**, never `npm install`, so versions match the SDK.
11. **Routes live in `src/app/` only.** Components, hooks, the database and the overload engine live elsewhere in `src/`.
12. **Style with design tokens.** Accent purple `#5B3DF5`, Sora font. No hard-coded colors or font sizes in components. See `docs/design-system.md`.
13. **Use the project's stack.** Zustand for state and Drizzle for database access. Don't add a second state library or scatter raw SQL.
