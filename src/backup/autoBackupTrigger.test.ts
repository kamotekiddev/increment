import { contentFingerprint } from "./autoBackupText";
import { checkAutoBackup, summaryClosed, summaryOpened, type TriggerEnv } from "./autoBackupTrigger";

const DAY = 24 * 60 * 60 * 1000;
const NOW = 1_800_000_000_000;
const TEXT = '{"exported_at":1,"sets":[1]}';

function env(over: Partial<TriggerEnv> = {}): TriggerEnv & { run: jest.Mock } {
  return {
    isPro: () => true,
    settings: () => ({ on: true, frequency: "afterEvery" }),
    lastBackupAt: () => NOW - 10 * DAY,
    lastHash: () => "stale",
    buildText: () => TEXT,
    latestFinishedAt: () => NOW - DAY,
    run: jest.fn(() => "saved" as const),
    ...over,
  } as TriggerEnv & { run: jest.Mock };
}

const unchanged = { lastHash: () => contentFingerprint(TEXT) };

describe("checkAutoBackup", () => {
  it("writes after a finished workout on After every workout, even with unchanged data", () => {
    const e = env(unchanged);
    expect(checkAutoBackup("workout-finished", NOW, e)).toBe("saved");
    expect(e.run).toHaveBeenCalledWith(NOW);
  });

  it("when a workout summary closes, Every day, week and month write only if the interval has passed and data changed", () => {
    for (const frequency of ["daily", "weekly", "monthly"] as const) {
      const settings = () => ({ on: true, frequency });
      const due = env({ settings, lastBackupAt: () => NOW - 40 * DAY });
      expect(checkAutoBackup("workout-finished", NOW, due)).toBe("saved");
      const early = env({ settings, lastBackupAt: () => NOW - 3600_000 });
      expect(checkAutoBackup("workout-finished", NOW, early)).toBe("skipped");
      expect(early.run).not.toHaveBeenCalled();
    }
  });

  it("at app open, After every workout catches up from the latest finished workout, without building the export", () => {
    const buildText = jest.fn(() => TEXT);
    const behind = env({ buildText, lastBackupAt: () => NOW - 10 * DAY, latestFinishedAt: () => NOW - 2 * DAY });
    expect(checkAutoBackup("foreground", NOW, behind)).toBe("saved");
    expect(behind.run).toHaveBeenCalledWith(NOW);
    const current = env({ buildText, lastBackupAt: () => NOW - DAY, latestFinishedAt: () => NOW - 2 * DAY });
    expect(checkAutoBackup("foreground", NOW, current)).toBe("skipped");
    expect(buildText).not.toHaveBeenCalled();
  });

  it("at app open, After every workout writes when there was never a backup", () => {
    expect(checkAutoBackup("foreground", NOW, env({ lastBackupAt: () => null, latestFinishedAt: () => null }))).toBe("saved");
  });

  it("at app open, weekly writes at 7 days with changed data, not at 6 days or when unchanged", () => {
    const weekly = { on: true, frequency: "weekly" as const };
    expect(checkAutoBackup("foreground", NOW, env({ settings: () => weekly, lastBackupAt: () => NOW - 7 * DAY }))).toBe("saved");
    expect(checkAutoBackup("foreground", NOW, env({ settings: () => weekly, lastBackupAt: () => NOW - 6 * DAY }))).toBe("skipped");
    expect(checkAutoBackup("foreground", NOW, env({ ...unchanged, settings: () => weekly, lastBackupAt: () => NOW - 8 * DAY }))).toBe("skipped");
  });

  it("a due backup builds the export once and hands that text to the write", () => {
    const buildText = jest.fn(() => TEXT);
    const e = env({ buildText, settings: () => ({ on: true, frequency: "daily" }) });
    expect(checkAutoBackup("foreground", NOW, e)).toBe("saved");
    expect(buildText).toHaveBeenCalledTimes(1);
    expect(e.run).toHaveBeenCalledWith(NOW, TEXT);
  });

  it("does not build the export before the interval has passed", () => {
    const buildText = jest.fn(() => TEXT);
    checkAutoBackup("foreground", NOW, env({ settings: () => ({ on: true, frequency: "monthly" }), lastBackupAt: () => NOW - DAY, buildText }));
    expect(buildText).not.toHaveBeenCalled();
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
    expect(checkAutoBackup("foreground", NOW, env({ latestFinishedAt: boom }))).toBe("failed");
  });
});
