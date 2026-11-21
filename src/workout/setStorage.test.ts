import { rowFromStored, weightToStore } from "./setStorage";

const stored = (weight: number, done: boolean, edited = false) => ({ weight, weightUnit: "kg" as const, reps: 8, done, edited });

describe("set storage", () => {
  it("stores a blank weight as 0 and a typed weight as is", () => {
    expect(weightToStore(null)).toBe(0);
    expect(weightToStore(62.5)).toBe(62.5);
  });
  it("reads a not-done 0 set back as blank", () => {
    expect(rowFromStored(stored(0, false))).toEqual({ weight: null, unit: "kg", reps: 8, done: false, edited: false });
  });
  it("reads a done set or a real weight back as is", () => {
    expect(rowFromStored(stored(0, true)).weight).toBe(0);
    expect(rowFromStored(stored(60, false)).weight).toBe(60);
  });
  it("reads the saved unit back with the number", () => {
    expect(rowFromStored({ weight: 135, weightUnit: "lb", reps: 5, done: true, edited: false })).toMatchObject({ weight: 135, unit: "lb" });
  });
  it("reads the saved edited mark back", () => {
    expect(rowFromStored(stored(60, false, true)).edited).toBe(true);
  });
});
