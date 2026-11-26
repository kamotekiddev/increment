import { PAYWALL_PATH } from "@/pro/proRoutes";

/** The Create backup button: the one place Your data turns the Pro answer into a label and a destination. */
export interface CreateBackupButton {
  label: string;
  icon: "share-outline" | "lock-closed-outline";
  /** The Paywall path for a free lifter; null when Create backup runs. */
  paywall: typeof PAYWALL_PATH | null;
}

export function createBackupButton(isPro: boolean): CreateBackupButton {
  return isPro
    ? { label: "Create backup", icon: "share-outline", paywall: null }
    : { label: "Unlock backups with Pro", icon: "lock-closed-outline", paywall: PAYWALL_PATH };
}
