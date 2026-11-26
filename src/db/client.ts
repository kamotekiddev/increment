import { drizzle } from "drizzle-orm/expo-sqlite";
import { Directory, File, Paths } from "expo-file-system";
import { openDatabaseSync } from "expo-sqlite";
import { Platform } from "react-native";

import { moveDatabase, type DbFiles } from "./dbMove";
import * as schema from "./schema";

const DB_NAME = "increment.db";

const trimSlash = (uri: string): string => uri.replace(/\/+$/, "");

const fileOps: DbFiles = {
  exists: (p) => new File(p).exists,
  size: (p) => new File(p).size,
  copy: (from, to) => new File(from).copySync(new File(to)),
  rename: (from, to) => new File(from).moveSync(new File(to)),
  remove: (p) => new File(p).delete(),
  ensureDir: (dir) => new Directory(dir).create({ intermediates: true, idempotent: true }),
};

/**
 * Where the database lives. Android keeps expo-sqlite's default folder. On iOS the default is `Documents/SQLite`, which
 * Files shows (`UIFileSharingEnabled` in app.json, for the backup files) and lets the lifter delete, so the database
 * sits in `Library/Application Support` instead, and an existing one is moved there once, before it is opened. If the
 * move fails the old location stays in use, so no data is left behind. Returns the `directory` argument for
 * `openDatabaseSync` (undefined for the default).
 */
function databaseDirectory(): string | undefined {
  if (Platform.OS !== "ios") return undefined;
  try {
    const oldDir = trimSlash(new Directory(Paths.document, "SQLite").uri);
    const newDir = trimSlash(new Directory(Paths.document.parentDirectory, "Library", "Application Support").uri);
    return moveDatabase(fileOps, oldDir, newDir, DB_NAME) === "failed" ? undefined : newDir;
  } catch {
    return undefined;
  }
}

const sqlite = openDatabaseSync(DB_NAME, undefined, databaseDirectory());
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

/** What a read-or-insert query needs: the database or a transaction on it. */
export type SelectInsertDb = Pick<Db, "select" | "insert">;
