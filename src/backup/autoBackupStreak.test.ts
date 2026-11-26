import { failureAlertBody, nextStreak } from "./autoBackupStreak";

describe("nextStreak", () => {
  it("a first failure sets the flag and alerts", () => {
    expect(nextStreak(false, "failed")).toEqual({ flag: true, alert: true });
  });
  it("a repeat failure in the same streak stays set and does not alert", () => {
    expect(nextStreak(true, "failed")).toEqual({ flag: true, alert: false });
  });
  it("a success clears the streak, so the next failure alerts again", () => {
    expect(nextStreak(true, "saved")).toEqual({ flag: false, alert: false });
    expect(nextStreak(nextStreak(true, "saved").flag, "failed").alert).toBe(true);
  });
  it("a skipped result is not a failure and changes nothing", () => {
    expect(nextStreak(true, "skipped")).toEqual({ flag: true, alert: false });
    expect(nextStreak(false, "skipped")).toEqual({ flag: false, alert: false });
  });
  it("a failure the lifter already sees on the screen sets the flag without an alert", () => {
    expect(nextStreak(false, "failed", false)).toEqual({ flag: true, alert: false });
  });
});

describe("failureAlertBody", () => {
  it("names the last backup date", () => {
    expect(failureAlertBody(new Date(2026, 10, 14, 18, 42).getTime())).toBe("Your last backup was 14 Nov 2026.");
  });
  it("says so when there is no backup yet", () => {
    expect(failureAlertBody(null)).toBe("You have no backup yet.");
  });
});
