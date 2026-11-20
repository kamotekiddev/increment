import { shouldHoldWakeLock } from "./wakeLock";

describe("shouldHoldWakeLock", () => {
  it("holds while the live workout is open and Keep screen awake is on", () => {
    expect(shouldHoldWakeLock({ liveWorkoutOpen: true, keepScreenAwake: true })).toBe(true);
  });

  it("releases when the setting is off", () => {
    expect(shouldHoldWakeLock({ liveWorkoutOpen: true, keepScreenAwake: false })).toBe(false);
  });

  it("never holds outside the live workout, even with the setting on", () => {
    expect(shouldHoldWakeLock({ liveWorkoutOpen: false, keepScreenAwake: true })).toBe(false);
    expect(shouldHoldWakeLock({ liveWorkoutOpen: false, keepScreenAwake: false })).toBe(false);
  });
});
