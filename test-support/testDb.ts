import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import type { Db } from "../src/db/client";
import * as schema from "../src/db/schema";

/** An in-memory database with every real migration applied, typed as the app's Db (both drivers are synchronous). Test use only. */
export function createTestDb(): Db {
  const db = drizzle(new Database(":memory:"), { schema });
  migrate(db, { migrationsFolder: "./drizzle" });
  return db as unknown as Db;
}
