import { PAYWALL_PATH } from "@/pro/proRoutes";

import { createBackupButton } from "./backupPro";

describe("createBackupButton", () => {
  it("is Create backup for a Pro lifter, with nothing to open", () => {
    expect(createBackupButton(true)).toEqual({ label: "Create backup", icon: "share-outline", paywall: null });
  });

  it("is the locked button for a free lifter, opening the Paywall", () => {
    expect(createBackupButton(false)).toEqual({ label: "Unlock backups with Pro", icon: "lock-closed-outline", paywall: PAYWALL_PATH });
  });
});
