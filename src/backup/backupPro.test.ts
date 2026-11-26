import { PAYWALL_PATH } from "@/pro/proRoutes";

import { autoBackupRow, createBackupButton } from "./backupPro";

describe("autoBackupRow", () => {
  it("opens Automatic backups for a Pro lifter", () => {
    expect(autoBackupRow(true)).toEqual({ showProTag: false, path: "/automatic-backups" });
  });

  it("shows the grey Pro tag and opens the Paywall for a free lifter", () => {
    expect(autoBackupRow(false)).toEqual({ showProTag: true, path: PAYWALL_PATH });
  });
});

describe("createBackupButton", () => {
  it("is Create backup for a Pro lifter, with nothing to open", () => {
    expect(createBackupButton(true)).toEqual({ label: "Create backup", icon: "share-outline", paywall: null });
  });

  it("is the locked button for a free lifter, opening the Paywall", () => {
    expect(createBackupButton(false)).toEqual({ label: "Unlock backups with Pro", icon: "lock-closed-outline", paywall: PAYWALL_PATH });
  });
});
