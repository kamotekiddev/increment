import Database from "better-sqlite3";
import { readFileSync } from "fs";
import { join } from "path";

const FOLDER = "./drizzle";

interface Journal {
  entries: { idx: number; tag: string }[];
}

/** Runs one migration file's statements, split at drizzle's breakpoints. */
function apply(sqlite: Database.Database, tag: string): void {
  const sql = readFileSync(join(FOLDER, `${tag}.sql`), "utf8");
  for (const statement of sql.split("--> statement-breakpoint")) {
    if (statement.trim()) sqlite.exec(statement);
  }
}

/**
 * A raw in-memory database migrated up to and including migration `upTo` (its journal idx), so a test can
 * insert rows in an older schema and then run the next migration with `migrateTo`. Test use only.
 */
export function createDbAtMigration(upTo: number): { sqlite: Database.Database; migrateTo: (idx: number) => void } {
  const journal: Journal = JSON.parse(readFileSync(join(FOLDER, "meta/_journal.json"), "utf8"));
  const sqlite = new Database(":memory:");
  // As in src/db/client.ts: foreign keys are off while migrations run, so a table rebuild cannot cascade-delete rows.
  sqlite.pragma("foreign_keys = OFF");
  let at = -1;
  const migrateTo = (idx: number) => {
    for (const entry of journal.entries) {
      if (entry.idx > at && entry.idx <= idx) apply(sqlite, entry.tag);
    }
    at = Math.max(at, idx);
  };
  migrateTo(upTo);
  return { sqlite, migrateTo };
}
