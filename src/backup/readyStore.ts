import { create } from "zustand";

import type { CreatedBackup } from "./backupQueries";
import type { BackupFile } from "./backupShare";

/** The backup just created, handed from Your data to Backup ready. */
export interface ReadyBackup {
  backup: CreatedBackup;
  file: BackupFile;
}

/** Holds the backup Backup ready shows, since a route can't carry a file. Cleared when that screen closes. */
export const useReadyBackup = create<{ ready: ReadyBackup | null; set: (ready: ReadyBackup | null) => void }>((set) => ({
  ready: null,
  set: (ready) => set({ ready }),
}));
