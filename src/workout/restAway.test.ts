import { endedWhileAway, trackAway, type AwayTrace } from "./restAway";

describe("trackAway", () => {
  it("starts an away span when the app leaves the active state", () => {
    expect(trackAway(null, "background", 100)).toEqual({ from: 100, to: null });
  });

  it("does not count inactive (a sheet or the app switcher) as away", () => {
    expect(trackAway(null, "inactive", 100)).toBeNull();
  });

  it("starts the span at background, after inactive", () => {
    const t = trackAway(null, "inactive", 100);
    expect(trackAway(t, "background", 150)).toEqual({ from: 150, to: null });
  });

  it("keeps an open span through inactive on the way back", () => {
    const t: AwayTrace = { from: 100, to: null };
    expect(trackAway(t, "inactive", 300)).toBe(t);
  });

  it("starts as away when the screen mounts while the app is not active", () => {
    expect(trackAway(null, "background", 5)).toEqual({ from: 5, to: null });
  });

  it("closes the span when the app becomes active", () => {
    expect(trackAway({ from: 100, to: null }, "active", 400)).toEqual({ from: 100, to: 400 });
  });

  it("leaves a closed span alone while active", () => {
    const t: AwayTrace = { from: 100, to: 400 };
    expect(trackAway(t, "active", 500)).toBe(t);
  });

  it("starts a new span after returning", () => {
    expect(trackAway({ from: 100, to: 400 }, "background", 900)).toEqual({ from: 900, to: null });
  });

  it("does nothing when active and never away", () => {
    expect(trackAway(null, "active", 10)).toBeNull();
  });
});

describe("endedWhileAway", () => {
  it("is false when the app was never away", () => {
    expect(endedWhileAway(1_000, null)).toBe(false);
  });

  it("is true when the app left before the end and is still away", () => {
    expect(endedWhileAway(1_000, { from: 500, to: null })).toBe(true);
  });

  it("is true when the app left before the end and came back after it", () => {
    expect(endedWhileAway(1_000, { from: 500, to: 1_500 })).toBe(true);
  });

  it("is false when the app came back before the end", () => {
    expect(endedWhileAway(1_000, { from: 200, to: 600 })).toBe(false);
  });

  it("is false when the app left only after the end", () => {
    expect(endedWhileAway(1_000, { from: 1_200, to: null })).toBe(false);
  });
});
