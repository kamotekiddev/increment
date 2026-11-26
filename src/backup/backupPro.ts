import { PAYWALL_PATH } from "@/pro/proRoutes";

/** The Create backup button: the one place Your data turns the Pro answer into a label and a destination. */
export interface CreateBackupButton {
  label: string;
  icon: "share-outline" | "lock-closed-outline";
  /** The Paywall path for a free lifter; null when Create backup runs. */
  paywall: typeof PAYWALL_PATH | null;
}

/** The Automatic backups screen. */
export const AUTO_BACKUP_PATH = "/automatic-backups";

/** The Automatic backups row on Your data: a free lifter gets a grey Pro tag and the Paywall, never the screen. */
export function autoBackupRow(isPro: boolean): { showProTag: boolean; path: typeof AUTO_BACKUP_PATH | typeof PAYWALL_PATH } {
  return isPro ? { showProTag: false, path: AUTO_BACKUP_PATH } : { showProTag: true, path: PAYWALL_PATH };
}

export function createBackupButton(isPro: boolean): CreateBackupButton {
  return isPro
    ? { label: "Create backup", icon: "share-outline", paywall: null }
    : { label: "Unlock backups with Pro", icon: "lock-closed-outline", paywall: PAYWALL_PATH };
}
