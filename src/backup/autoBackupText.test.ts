import { autoBackupFileName, autoBackupPrune, contentFingerprint, folderLabel, isAutoBackupName, parseKeep, KEEP_DEFAULT } from "./autoBackupText";

const at = (d: number, h = 18, m = 42) => new Date(2026, 10, d, h, m);

describe("autoBackupFileName", () => {
  it("is 'Increment auto backup {date} {HH-mm}.increment' in local time", () => {
    expect(autoBackupFileName(new Date(2026, 10, 14, 18, 42), [])).toBe("Increment auto backup 14 Nov 2026 18-42.increment");
    expect(autoBackupFileName(new Date(2026, 10, 4, 7, 5), [])).toBe("Increment auto backup 4 Nov 2026 07-05.increment");
  });

  it("gets (2) when the folder already has that name in the same minute", () => {
    const first = autoBackupFileName(at(14), []);
    expect(autoBackupFileName(at(14), [first])).toBe("Increment auto backup 14 Nov 2026 18-42 (2).increment");
  });
});

describe("isAutoBackupName", () => {
  it("accepts only auto backup names", () => {
    expect(isAutoBackupName(autoBackupFileName(at(14), []))).toBe(true);
    expect(isAutoBackupName("Increment auto backup 14 Nov 2026 18-42 (3).increment")).toBe(true);
    expect(isAutoBackupName("Increment backup 14 Nov 2026.increment")).toBe(false);
    expect(isAutoBackupName("Increment auto backup notes.txt")).toBe(false);
    expect(isAutoBackupName("holiday.jpg")).toBe(false);
  });
});

describe("autoBackupPrune", () => {
  const name = (d: number, h = 18) => autoBackupFileName(at(d, h), []);

  it("returns the oldest auto files beyond Keep", () => {
    const names = [name(10), name(12), name(11), name(14), name(13)];
    expect(autoBackupPrune(names, 3).sort()).toEqual([name(10), name(11)].sort());
  });

  it("returns nothing at or under Keep", () => {
    expect(autoBackupPrune([name(10), name(11)], 5)).toEqual([]);
    expect(autoBackupPrune([name(10), name(11)], 2)).toEqual([]);
  });

  it("never lists a manual backup, a stranger, or an unreadable auto-prefixed name", () => {
    const names = [name(10), name(11), "Increment backup 1 Nov 2026.increment", "photo.jpg", "Increment auto backup mine.increment"];
    expect(autoBackupPrune(names, 1)).toEqual([name(10)]);
  });

  it("treats a (2) file as newer than its sibling from the same minute", () => {
    const a = autoBackupFileName(at(14), []);
    const b = autoBackupFileName(at(14), [a]);
    expect(autoBackupPrune([b, a], 1)).toEqual([a]);
  });

  it("orders across months and years by date, not by text", () => {
    const dec = autoBackupFileName(new Date(2025, 11, 30, 9, 0), []);
    const jan = autoBackupFileName(new Date(2026, 0, 2, 9, 0), []);
    expect(autoBackupPrune([jan, dec], 1)).toEqual([dec]);
  });
});

describe("contentFingerprint", () => {
  const file = (exportedAt: number, extra = "") => `{"format":"increment-backup","format_version":1,"exported_at":${exportedAt},"app_version":"1.0.0","sets":[${extra}]}`;

  it("ignores exported_at", () => {
    expect(contentFingerprint(file(1))).toBe(contentFingerprint(file(999_999)));
  });

  it("changes when the content changes", () => {
    expect(contentFingerprint(file(1))).not.toBe(contentFingerprint(file(1, '{"id":1}')));
  });
});

describe("parseKeep", () => {
  it("accepts 3, 5, 10 and 20 and falls back to 5", () => {
    expect([3, 5, 10, 20].map(parseKeep)).toEqual([3, 5, 10, 20]);
    expect(parseKeep(7)).toBe(KEEP_DEFAULT);
    expect(parseKeep(null)).toBe(KEEP_DEFAULT);
    expect(parseKeep("10")).toBe(KEEP_DEFAULT);
  });
});

describe("folderLabel", () => {
  it("shows the folder's own name from an Android tree uri", () => {
    expect(folderLabel("content://com.android.externalstorage.documents/tree/primary%3ADocuments%2FIncrement")).toBe("Documents/Increment");
    expect(folderLabel("content://com.android.externalstorage.documents/tree/1234-ABCD%3ABackups")).toBe("Backups");
  });

  it("falls back to the last segment", () => {
    expect(folderLabel("content://x/tree/Downloads")).toBe("Downloads");
  });
});
