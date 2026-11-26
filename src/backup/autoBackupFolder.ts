import Constants from "expo-constants";
import { Directory, Paths } from "expo-file-system";
import { Platform } from "react-native";

import { proStore } from "@/pro";

import { readAutoBackupSettings, writeAutoBackupFolder, writeLastBackupHash } from "./autoBackupSettings";
import { writeAutoBackup, type AutoBackupResult, type BackupFolder } from "./autoBackupWrite";
import { createBackup, writeLastBackup } from "./backupQueries";

/** How the Android folder picker ended. */
export type FolderPickResult = "picked" | "cancelled" | "failed";

/**
 * Android: opens the system folder picker and stores the chosen folder (the picker keeps the permission across
 * launches). Backing out is "cancelled", not an error. Never throws.
 */
export async function pickAutoBackupFolder(): Promise<FolderPickResult> {
  try {
    const directory = await Directory.pickDirectoryAsync();
    writeAutoBackupFolder(directory.uri);
    return "picked";
  } catch (e) {
    return typeof e === "object" && e !== null && (e as { code?: unknown }).code === "ERR_PICKER_CANCELLED" ? "cancelled" : "failed";
  }
}

function folderFor(directory: Directory): BackupFolder {
  const entries = () => directory.list();
  return {
    names: () => entries().map((e) => e.name),
    write: (name, text) => directory.createFile(name, "application/octet-stream").write(text),
    remove: (name) => {
      const entry = entries().find((e) => e.name === name);
      if (entry) entry.delete();
    },
  };
}

/**
 * Where automatic backups go: iOS the app's Documents folder (shown in Files), Android the folder the lifter picked.
 * Null when there is none, or the stored folder is gone or its access was revoked. Never throws.
 */
export function openAutoBackupFolder(): BackupFolder | null {
  try {
    const directory = Platform.OS === "ios" ? Paths.document : readAutoBackupSettings().folder ? new Directory(readAutoBackupSettings().folder as string) : null;
    if (directory === null || !directory.exists) return null;
    directory.list();
    return folderFor(directory);
  } catch {
    return null;
  }
}

/**
 * Writes one automatic backup now (always, changed or not): builds the backup, writes the file, sets Last backup and
 * the content fingerprint, then prunes to Keep. Never throws.
 */
export function runAutoBackup(now: number): AutoBackupResult {
  try {
    const { text } = createBackup(now, Constants.expoConfig?.version ?? "1.0.0");
    return writeAutoBackup({
      folder: openAutoBackupFolder(),
      isPro: proStore.getState().isPro,
      text,
      now,
      keep: readAutoBackupSettings().keep,
      onWritten: ({ at, hash }) => {
        writeLastBackup(at);
        writeLastBackupHash(hash);
      },
    });
  } catch {
    return "failed";
  }
}
