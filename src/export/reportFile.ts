import { File, Paths } from "expo-file-system";
import * as Print from "expo-print";

import type { BackupFile } from "@/backup/backupShare";

/** Renders the report HTML to a PDF named `fileName` in the cache (a copy is shared, nothing else keeps it). */
export async function writeReportFile(fileName: string, html: string): Promise<BackupFile> {
  const printed = await Print.printToFileAsync({ html });
  const file = new File(printed.uri);
  const named = new File(Paths.cache, fileName);
  file.moveSync(named, { overwrite: true });
  return { uri: file.uri, bytes: file.size };
}
