import { drizzle } from "drizzle-orm/expo-sqlite";
import { openDatabaseSync } from "expo-sqlite";

import * as schema from "./schema";

const sqlite = openDatabaseSync("increment.db");
// Foreign keys stay OFF while migrations run. Drizzle runs a migration inside a transaction, where
// `PRAGMA foreign_keys = OFF` inside the migration file is ignored. A table rebuild (drop and
// rename, as in 0001) would then cascade-delete child rows. The app calls enableForeignKeys()
// once migrations have succeeded; the schema relies on cascades after that.
sqlite.execSync("PRAGMA foreign_keys = OFF;");

export function enableForeignKeys(): void {
  sqlite.execSync("PRAGMA foreign_keys = ON;");
}

export const db = drizzle(sqlite, { schema });
export type Db = typeof db;
