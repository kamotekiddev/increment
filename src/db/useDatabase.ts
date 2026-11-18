import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";

import migrations from "../../drizzle/migrations";
import { loadUnit } from "../settings";
import { db, enableForeignKeys } from "./client";
import { seedLibrary } from "./seed";

export type DatabaseState = { ready: boolean; error: Error | null };

// Seeding is synchronous and idempotent; the flag stops a remount or StrictMode from repeating it.
let seedResult: { error: Error | null } | null = null;

let foreignKeysEnabled = false;

function foreignKeysOnce(): void {
  if (!foreignKeysEnabled) {
    enableForeignKeys();
    foreignKeysEnabled = true;
  }
}

function seedOnce(): { error: Error | null } {
  if (!seedResult) {
    try {
      seedLibrary(db);
      // The unit is read once here so every screen starts with the saved one (no flash of kg).
      loadUnit();
      seedResult = { error: null };
    } catch (e) {
      seedResult = { error: e instanceof Error ? e : new Error(String(e)) };
    }
  }
  return seedResult;
}

/**
 * Applies pending migrations, then seeds the library on first launch.
 * The seed runs once per app process, derived during render (not in an effect) so a remount
 * or StrictMode can never repeat it; seeding is also idempotent in the database.
 */
export function useDatabase(): DatabaseState {
  const { success, error: migrationError } = useMigrations(db, migrations);
  // Foreign keys stay off during migrations (see client.ts); switch them on as a step of its own
  // once migrations have succeeded, before anything else touches the database.
  if (success) foreignKeysOnce();
  const seed = success ? seedOnce() : null;
  return { ready: seed !== null && seed.error === null, error: migrationError ?? seed?.error ?? null };
}
