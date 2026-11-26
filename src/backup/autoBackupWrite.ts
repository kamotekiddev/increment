import { autoBackupFileName, autoBackupPrune, contentFingerprint } from "./autoBackupText";

/** A folder the automatic backup writes into. The platform wrapper (`autoBackupFolder.ts`) supplies the real one. */
export interface BackupFolder {
  /** The names of the files in the folder. Throws if the folder is missing or access was revoked. */
  names(): string[];
  /** Creates a file with this name and text. Throws if it can't. */
  write(name: string, text: string): void;
  /** Deletes the file with this name. Throws if it can't. */
  remove(name: string): void;
}

export interface AutoBackupInput {
  folder: BackupFolder | null;
  /** The backup text (from `createBackup`). */
  text: string;
  now: number;
  keep: number;
  /** Called once the file is written, before pruning. */
  onWritten: (info: { at: number; hash: string }) => void;
}

export type AutoBackupResult = "saved" | "failed";

/**
 * Writes one automatic backup file, then prunes the folder to the newest `keep`. A missing folder or a failed write is
 * "failed" (nothing is recorded); a failed delete never turns a written backup into a failure. Never throws.
 */
export function writeAutoBackup({ folder, text, now, keep, onWritten }: AutoBackupInput): AutoBackupResult {
  if (folder === null) return "failed";
  let names: string[];
  try {
    names = folder.names();
    folder.write(autoBackupFileName(new Date(now), names), text);
  } catch {
    return "failed";
  }
  try {
    onWritten({ at: now, hash: contentFingerprint(text) });
  } catch {
    return "failed";
  }
  try {
    for (const name of autoBackupPrune(folder.names(), keep)) {
      try {
        folder.remove(name);
      } catch {
        // Leave it for the next write.
      }
    }
  } catch {
    // The listing failed after a good write: the next write prunes.
  }
  return "saved";
}
