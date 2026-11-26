import { contentFingerprint } from "./autoBackupText";
import { isBackupDue, parseFrequency } from "./autoBackupDue";

const DAY = 24 * 60 * 60 * 1000;
const now = 1_800_000_000_000;

describe("isBackupDue", () => {
  it("daily, weekly and monthly are due at 1, 7 and 30 days, not just under", () => {
    for (const [frequency, days] of [["daily", 1], ["weekly", 7], ["monthly", 30]] as const) {
      expect(isBackupDue(frequency, now - days * DAY + 1, now, true)).toBe(false);
      expect(isBackupDue(frequency, now - days * DAY, now, true)).toBe(true);
      expect(isBackupDue(frequency, now - days * DAY - 1, now, true)).toBe(true);
    }
  });

  it("is not due when the data is unchanged", () => {
    expect(isBackupDue("daily", now - 3 * DAY, now, false)).toBe(false);
    expect(isBackupDue("monthly", now - 90 * DAY, now, false)).toBe(false);
  });

  it("is due when never backed up and the data changed", () => {
    for (const f of ["daily", "weekly", "monthly"] as const) expect(isBackupDue(f, null, now, true)).toBe(true);
  });

  it("After every workout has no interval: due whenever the data changed", () => {
    expect(isBackupDue("afterEvery", now - 1000, now, true)).toBe(true);
    expect(isBackupDue("afterEvery", now - 1000, now, false)).toBe(false);
  });

  it("a manual backup restarts the interval (it moves lastBackupAt)", () => {
    expect(isBackupDue("weekly", now - 8 * DAY, now, true)).toBe(true);
    expect(isBackupDue("weekly", now - 1 * DAY, now, true)).toBe(false);
  });
});

describe("parseFrequency", () => {
  it("falls back to After every workout", () => {
    expect(parseFrequency(undefined)).toBe("afterEvery");
    expect(parseFrequency("hourly")).toBe("afterEvery");
    expect(parseFrequency("weekly")).toBe("weekly");
  });
});

describe("fingerprint for the changed check", () => {
  const backup = (exportedAt: number, sets: number) => `{"format":1,"exported_at":${exportedAt},"sets":${sets}}`;
  it("ignores exported_at and changes with a set", () => {
    expect(contentFingerprint(backup(1, 4))).toBe(contentFingerprint(backup(999, 4)));
    expect(contentFingerprint(backup(1, 4))).not.toBe(contentFingerprint(backup(1, 5)));
  });
});
