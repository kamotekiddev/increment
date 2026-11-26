import { Directory, File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform, Share } from "react-native";

import { uniqueFileName, type FolderSaveResult, type ShareResult } from "./backupText";

/** A backup file written to the app's cache, ready to share. */
export interface BackupFile {
  uri: string;
  bytes: number;
}

/** Writes the backup text to a file named `fileName` in the cache (a copy is shared, nothing else keeps it). */
export function writeBackupFile(fileName: string, text: string): BackupFile {
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true });
  file.write(text);
  return { uri: file.uri, bytes: file.size };
}

/** Deletes a cached copy (the backup written to share, or the file just picked). Best effort: never throws. */
export function deleteCachedFile(uri: string): void {
  try {
    const file = new File(uri);
    if (file.exists) file.delete();
  } catch {
    // The cache is cleared by the system anyway.
  }
}

/**
 * Android: lets the lifter pick a folder and writes the backup there as `fileName` (a unique name if the folder already
 * has one). The picker rejects with code ERR_PICKER_CANCELLED when the lifter backs out: that is "cancelled", not an
 * error. The file is created as application/octet-stream so Android keeps the `.increment` name as typed (a text type
 * like text/plain makes the provider append `.txt`). Never throws.
 */
export async function saveBackupToFolder(fileName: string, text: string): Promise<FolderSaveResult> {
  let directory: Directory;
  try {
    directory = await Directory.pickDirectoryAsync();
  } catch (e) {
    return isPickerCancelled(e) ? "cancelled" : "failed";
  }
  try {
    const existing = directory.list().map((entry) => entry.name);
    const file = directory.createFile(uniqueFileName(fileName, existing), "application/octet-stream");
    file.write(text);
    return "saved";
  } catch {
    return "failed";
  }
}

function isPickerCancelled(e: unknown): boolean {
  return typeof e === "object" && e !== null && (e as { code?: unknown }).code === "ERR_PICKER_CANCELLED";
}

/**
 * Opens the share sheet for the file and says how it ended. iOS reports whether the lifter finished or dismissed the
 * sheet (React Native's `Share`). Android's share sheet reports nothing back, and expo-sharing resolves when it
 * closes either way, so there a closed sheet counts as shared. Never throws.
 */
export async function shareBackupFile(file: BackupFile): Promise<ShareResult> {
  try {
    if (Platform.OS === "ios") {
      const result = await Share.share({ url: file.uri });
      return result.action === Share.sharedAction ? "shared" : "dismissed";
    }
    if (!(await Sharing.isAvailableAsync())) return "failed";
    await Sharing.shareAsync(file.uri, { mimeType: "application/json", dialogTitle: "Save or share backup" });
    return "shared";
  } catch {
    return "failed";
  }
}
