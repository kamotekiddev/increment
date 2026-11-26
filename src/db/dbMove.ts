/** The file operations a database move needs. `client.ts` supplies the expo-file-system one; tests supply a fake. */
export interface DbFiles {
  exists(path: string): boolean;
  size(path: string): number;
  /** Copies without overwriting an existing file at `to`. Throws if it can't. */
  copy(from: string, to: string): void;
  /** Renames a file within one folder. */
  rename(from: string, to: string): void;
  remove(path: string): void;
  /** Creates the folder and its parents if missing. */
  ensureDir(dir: string): void;
}

export type DbMoveResult = "moved" | "nothing" | "failed";

const SIDE_FILES = ["-wal", "-shm"];

/**
 * One-time safe move of a SQLite database (and its -wal and -shm files) from `oldDir` to `newDir`, before it is opened.
 * Runs only when the old database exists and the new one does not, and never overwrites a database. The main file is
 * copied under a temporary name and renamed last, so a database in the new folder is always complete; every copy is
 * checked by size before the old files are removed, and a failure removes the partial copies and leaves the old files
 * in place ("failed": the caller keeps opening the old location). Never throws.
 */
export function moveDatabase(files: DbFiles, oldDir: string, newDir: string, name: string): DbMoveResult {
  const newMain = `${newDir}/${name}`;
  try {
    if (!files.exists(`${oldDir}/${name}`) || files.exists(newMain)) return "nothing";
  } catch {
    return "failed";
  }
  const names = [name, ...SIDE_FILES.map((s) => name + s)];
  const temp = `${newDir}/${name}.moving`;
  const created: string[] = [];
  try {
    files.ensureDir(newDir);
    // Leftovers of an interrupted earlier move are ours (the new database does not exist yet): start clean.
    for (const p of [temp, ...SIDE_FILES.map((s) => newMain + s)]) if (files.exists(p)) files.remove(p);
    for (const n of names) {
      const from = `${oldDir}/${n}`;
      if (!files.exists(from)) continue;
      const to = n === name ? temp : `${newDir}/${n}`;
      files.copy(from, to);
      created.push(to);
      if (files.size(to) !== files.size(from)) throw new Error(`The copy of ${n} does not match`);
    }
    files.rename(temp, newMain);
  } catch {
    for (const p of created) {
      try {
        if (files.exists(p)) files.remove(p);
      } catch {
        // A stray partial file is cleaned at the next start.
      }
    }
    return "failed";
  }
  for (const n of [...names].reverse()) {
    try {
      if (files.exists(`${oldDir}/${n}`)) files.remove(`${oldDir}/${n}`);
    } catch {
      // The old files are harmless leftovers; the new database is complete.
    }
  }
  return "moved";
}
