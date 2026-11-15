import { useMigrations } from "drizzle-orm/expo-sqlite/migrator";
import { useEffect, useState } from "react";

import migrations from "../../drizzle/migrations";
import { db } from "./client";
import { seedLibrary } from "./seed";

export type DatabaseState = { ready: boolean; error: Error | null };

/** Applies pending migrations, then seeds the library on first launch. */
export function useDatabase(): DatabaseState {
  const { success, error: migrationError } = useMigrations(db, migrations);
  const [seeded, setSeeded] = useState(false);
  const [seedError, setSeedError] = useState<Error | null>(null);

  useEffect(() => {
    if (!success) return;
    seedLibrary(db).then(
      () => setSeeded(true),
      (e: unknown) => setSeedError(e instanceof Error ? e : new Error(String(e))),
    );
  }, [success]);

  return { ready: success && seeded, error: migrationError ?? seedError };
}
