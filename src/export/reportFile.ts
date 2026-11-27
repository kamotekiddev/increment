import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";

import { deleteCachedFile, type BackupFile } from "@/backup/backupShare";

/** Renders the report HTML to a PDF named `fileName` in the cache (a copy is shared, nothing else keeps it). */
export async function writeReportFile(fileName: string, html: string): Promise<BackupFile> {
  const printed = await Print.printToFileAsync({ html });
  try {
    const file = new File(printed.uri);
    const named = new File(Paths.cache, fileName);
    file.moveSync(named, { overwrite: true });
    return { uri: file.uri, bytes: file.size };
  } catch (error) {
    deleteCachedFile(printed.uri); // don't leave the temp PDF behind when the move fails
    throw error;
  }
}

/**
 * Deletes export files left in the cache by an earlier export. They are not deleted right after sharing (a receiving app
 * may still read the file after the share sheet closes), so the next export clears them first. Best effort: never throws.
 */
export function clearStaleExports(): void {
  try {
    for (const item of Paths.cache.list()) {
      if (item instanceof File && /^Increment export .*\.(csv|pdf)$/.test(item.name)) deleteCachedFile(item.uri);
    }
  } catch {
    // The cache is cleared by the system anyway.
  }
}
