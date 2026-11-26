import { checkAutoBackup, summaryClosed, summaryOpened, type TriggerEnv } from "./autoBackupTrigger";

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_800_000_000_000;

function env(over: Partial<TriggerEnv> = {}): TriggerEnv & { run: jest.Mock } {
  return {
    isPro: () => true,
    settings: () => ({ on: true, frequency: "afterEvery" }),
    lastBackupAt: () => NOW - 10 * DAY,
    lastHash: () => "old",
    fingerprint: () => "new",
    run: jest.fn(() => "saved" as const),
    ...over,
  } as TriggerEnv & { run: jest.Mock };
}

describe("checkAutoBackup", () => {
  it("writes after a finished workout on After every workout, even with an unchanged fingerprint", () => {
    const e = env({ fingerprint: () => "old" });
    expect(checkAutoBackup("workout-finished", NOW, e)).toBe("saved");
    expect(e.run).toHaveBeenCalledWith(NOW);
  });

  it("a finished workout does not write on Every day, Every week or Every month", () => {
    for (const frequency of ["daily", "weekly", "monthly"] as const) {
      const e = env({ settings: () => ({ on: true, frequency }) });
      expect(checkAutoBackup("workout-finished", NOW, e)).toBe("skipped");
      expect(e.run).not.toHaveBeenCalled();
    }
  });

  it("at app open, After every workout catches up only when the data changed", () => {
    expect(checkAutoBackup("foreground", NOW, env({ fingerprint: () => "old" }))).toBe("skipped");
    const e = env();
    expect(checkAutoBackup("foreground", NOW, e)).toBe("saved");
  });

  it("at app open, weekly writes at 7 days with changed data, not at 6 days or when unchanged", () => {
    const weekly = { on: true, frequency: "weekly" as const };
    expect(checkAutoBackup("foreground", NOW, env({ settings: () => weekly, lastBackupAt: () => NOW - 7 * DAY }))).toBe("saved");
    expect(checkAutoBackup("foreground", NOW, env({ settings: () => weekly, lastBackupAt: () => NOW - 6 * DAY }))).toBe("skipped");
    expect(checkAutoBackup("foreground", NOW, env({ settings: () => weekly, lastBackupAt: () => NOW - 8 * DAY, fingerprint: () => "old" }))).toBe("skipped");
  });

  it("does not build the fingerprint before the interval has passed", () => {
    const fingerprint = jest.fn(() => "new");
    checkAutoBackup("foreground", NOW, env({ settings: () => ({ on: true, frequency: "monthly" }), lastBackupAt: () => NOW - DAY, fingerprint }));
    expect(fingerprint).not.toHaveBeenCalled();
  });

  it("writes when there was never a backup", () => {
    const e = env({ settings: () => ({ on: true, frequency: "daily" }), lastBackupAt: () => null, lastHash: () => null });
    expect(checkAutoBackup("foreground", NOW, e)).toBe("saved");
  });

  it("never runs for a free lifter or when the switch is off", () => {
    const free = env({ isPro: () => false });
    expect(checkAutoBackup("workout-finished", NOW, free)).toBe("skipped");
    expect(free.run).not.toHaveBeenCalled();
    const off = env({ settings: () => ({ on: false, frequency: "afterEvery" }) });
    expect(checkAutoBackup("foreground", NOW, off)).toBe("skipped");
    expect(off.run).not.toHaveBeenCalled();
  });

  it("never runs while a workout summary is open, and runs again once it closes", () => {
    summaryOpened();
    const e = env();
    expect(checkAutoBackup("foreground", NOW, e)).toBe("skipped");
    expect(e.run).not.toHaveBeenCalled();
    summaryClosed();
    expect(checkAutoBackup("foreground", NOW, e)).toBe("saved");
  });

  it("reports failed when the write fails", () => {
    expect(checkAutoBackup("workout-finished", NOW, env({ run: jest.fn(() => "failed" as const) }))).toBe("failed");
  });

  it("never throws, whatever fails underneath", () => {
    const boom = () => {
      throw new Error("db");
    };
    expect(checkAutoBackup("foreground", NOW, env({ settings: boom }))).toBe("failed");
    expect(checkAutoBackup("foreground", NOW, env({ run: boom }))).toBe("failed");
    expect(checkAutoBackup("foreground", NOW, env({ isPro: boom }))).toBe("failed");
  });
});
