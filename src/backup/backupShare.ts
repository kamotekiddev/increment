import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import { Platform, Share } from "react-native";

import type { ShareResult } from "./backupText";

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
