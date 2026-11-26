import { create } from "zustand";

import type { BackupData } from "./backupFile";

/** A backup file the lifter picked and that passed its checks, handed from Your data to the restore preview. */
export interface PickedBackup {
  /** The file's name without `.increment`. */
  name: string;
  /** Size in bytes, when the picker reported it. */
  bytes: number | null;
  data: BackupData;
}

/** Holds the picked backup the preview shows, since a route can't carry it. Cleared when the preview closes. */
export const usePickedBackup = create<{ picked: PickedBackup | null; set: (picked: PickedBackup | null) => void }>((set) => ({
  picked: null,
  set: (picked) => set({ picked }),
}));
