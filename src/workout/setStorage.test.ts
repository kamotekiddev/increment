import { rowFromStored, weightToStore } from "./setStorage";

describe("set storage", () => {
  it("stores a blank weight as 0 and a typed weight as is", () => {
    expect(weightToStore(null)).toBe(0);
    expect(weightToStore(62.5)).toBe(62.5);
  });
  it("reads a not-done 0 kg set back as blank", () => {
    expect(rowFromStored({ weightKg: 0, reps: 8, done: false })).toEqual({ weightKg: null, reps: 8, done: false, edited: false });
  });
  it("reads a done set or a real weight back as is", () => {
    expect(rowFromStored({ weightKg: 0, reps: 8, done: true }).weightKg).toBe(0);
    expect(rowFromStored({ weightKg: 60, reps: 8, done: false }).weightKg).toBe(60);
  });
});
