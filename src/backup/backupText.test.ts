import {
  fileSizeText,
  lastBackupAfterFolderSave,
  lastBackupAfterShare,
  lastBackupAfterShareOn,
  lastBackupLabel,
  settingsSummary,
  storedLine,
  uniqueFileName,
} from "./backupText";

const NOV_14 = new Date(2026, 10, 14, 9, 30).getTime();

describe("lastBackupLabel", () => {
  it("says No backup yet before any backup was shared", () => {
    expect(lastBackupLabel(null)).toBe("No backup yet");
  });
  it("shows the local date of the last shared backup", () => {
    expect(lastBackupLabel(NOV_14)).toBe("Last backup 14 Nov 2026");
  });
});

describe("storedLine", () => {
  it("joins where the data lives with the backup state", () => {
    expect(storedLine(null)).toBe("Stored only on this phone · No backup yet");
    expect(storedLine(NOV_14)).toBe("Stored only on this phone · Last backup 14 Nov 2026");
  });
});

describe("lastBackupAfterShare", () => {
  const OLD = new Date(2026, 9, 1).getTime();
  it("moves to now when the share finished", () => {
    expect(lastBackupAfterShare("shared", NOV_14, OLD)).toBe(NOV_14);
    expect(lastBackupAfterShare("shared", NOV_14, null)).toBe(NOV_14);
  });
  it("changes nothing when the lifter cancelled", () => {
    expect(lastBackupAfterShare("dismissed", NOV_14, OLD)).toBe(OLD);
    expect(lastBackupAfterShare("dismissed", NOV_14, null)).toBeNull();
  });
  it("changes nothing when the share failed", () => {
    expect(lastBackupAfterShare("failed", NOV_14, OLD)).toBe(OLD);
  });
});

describe("uniqueFileName", () => {
  const NAME = "Increment backup 14 Nov 2026.increment";
  it("keeps the name when the folder has no file with it", () => {
    expect(uniqueFileName(NAME, [])).toBe(NAME);
    expect(uniqueFileName(NAME, ["Other.increment"])).toBe(NAME);
  });
  it("adds (2) before the extension when the name is taken", () => {
    expect(uniqueFileName(NAME, [NAME])).toBe("Increment backup 14 Nov 2026 (2).increment");
  });
  it("counts up past the numbers already taken", () => {
    const taken = [NAME, "Increment backup 14 Nov 2026 (2).increment", "Increment backup 14 Nov 2026 (3).increment"];
    expect(uniqueFileName(NAME, taken)).toBe("Increment backup 14 Nov 2026 (4).increment");
  });
});

describe("lastBackupAfterFolderSave", () => {
  const OLD = new Date(2026, 9, 1).getTime();
  it("moves to now only when the file was written", () => {
    expect(lastBackupAfterFolderSave("saved", NOV_14, OLD)).toBe(NOV_14);
  });
  it("keeps the old date on a cancelled pick or a failed write", () => {
    expect(lastBackupAfterFolderSave("cancelled", NOV_14, OLD)).toBe(OLD);
    expect(lastBackupAfterFolderSave("failed", NOV_14, null)).toBeNull();
  });
});

describe("lastBackupAfterShareOn", () => {
  const OLD = new Date(2026, 9, 1).getTime();
  it("on iOS follows the share result", () => {
    expect(lastBackupAfterShareOn("ios", "shared", NOV_14, OLD)).toBe(NOV_14);
    expect(lastBackupAfterShareOn("ios", "dismissed", NOV_14, OLD)).toBe(OLD);
  });
  it("on Android sharing never sets it, the sheet cannot report the outcome", () => {
    expect(lastBackupAfterShareOn("android", "shared", NOV_14, OLD)).toBe(OLD);
    expect(lastBackupAfterShareOn("android", "shared", NOV_14, null)).toBeNull();
  });
});

describe("settingsSummary", () => {
  it("joins the unit and the default rest as minutes and seconds", () => {
    expect(settingsSummary("kg", 150)).toBe("kg, 2:30 rest");
    expect(settingsSummary("lb", 90)).toBe("lb, 1:30 rest");
    expect(settingsSummary("kg", 600)).toBe("kg, 10:00 rest");
  });
});

describe("fileSizeText", () => {
  it("rounds up to whole KB so a small file never reads 0 KB", () => {
    expect(fileSizeText(190_464)).toBe("186 KB");
    expect(fileSizeText(100)).toBe("1 KB");
  });
  it("switches to MB from 1024 KB", () => {
    expect(fileSizeText(2_621_440)).toBe("2.5 MB");
  });
});
