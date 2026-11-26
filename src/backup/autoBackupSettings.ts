import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { settings } from "@/db/schema";

import { KEEP_DEFAULT, parseKeep, type Keep } from "./autoBackupText";

/** Keys in the `settings` key/value table (no migration). None of them travel in the backup file. */
const ON_KEY = "auto_backup_on";
const KEEP_KEY = "auto_backup_keep";
const FOLDER_KEY = "auto_backup_folder";
const HASH_KEY = "last_backup_hash";

function read(key: string): unknown {
  return db.select().from(settings).where(eq(settings.key, key)).get()?.value;
}

function write(key: string, value: unknown): void {
  db.insert(settings).values({ key, value }).onConflictDoUpdate({ target: settings.key, set: { value } }).run();
}

/** The Automatic backups settings as the screen shows them. */
export interface AutoBackupSettings {
  on: boolean;
  keep: Keep;
  /** Android: the picked folder's uri; null until one is picked (and always null on iOS). */
  folder: string | null;
}

export function readAutoBackupSettings(): AutoBackupSettings {
  const folder = read(FOLDER_KEY);
  return {
    on: read(ON_KEY) === true,
    keep: read(KEEP_KEY) === undefined ? KEEP_DEFAULT : parseKeep(read(KEEP_KEY)),
    folder: typeof folder === "string" && folder !== "" ? folder : null,
  };
}

export const writeAutoBackupOn = (on: boolean): void => write(ON_KEY, on);
export const writeAutoBackupKeep = (keep: Keep): void => write(KEEP_KEY, keep);
export const writeAutoBackupFolder = (uri: string): void => write(FOLDER_KEY, uri);

/** The content fingerprint of the last backup written (manual or automatic), or null if none. */
export function readLastBackupHash(): string | null {
  const v = read(HASH_KEY);
  return typeof v === "string" ? v : null;
}

export const writeLastBackupHash = (hash: string): void => write(HASH_KEY, hash);
