import { adjustSetup, canAdjust } from "./adjustSetup";
import { DEFAULT_SETUP, type ExerciseSetup } from "./routineSetup";

const base: ExerciseSetup = { ...DEFAULT_SETUP };

describe("adjustSetup", () => {
  it("steps sets by one within 1 to 10", () => {
    expect(adjustSetup(base, "sets", 1).sets).toBe(4);
    expect(adjustSetup({ ...base, sets: 10 }, "sets", 1).sets).toBe(10);
    expect(adjustSetup({ ...base, sets: 1 }, "sets", -1).sets).toBe(1);
  });

  it("keeps rep min at or below rep max", () => {
    expect(adjustSetup({ ...base, repMin: 12, repMax: 12 }, "repMin", 1).repMin).toBe(12);
    expect(adjustSetup(base, "repMin", 1).repMin).toBe(9);
    expect(adjustSetup({ ...base, repMin: 1 }, "repMin", -1).repMin).toBe(1);
  });

  it("keeps rep max at or above rep min and at most 30", () => {
    expect(adjustSetup({ ...base, repMin: 8, repMax: 8 }, "repMax", -1).repMax).toBe(8);
    expect(adjustSetup({ ...base, repMax: 30 }, "repMax", 1).repMax).toBe(30);
    expect(adjustSetup(base, "repMax", 1).repMax).toBe(13);
  });

  it("steps rest by 15 s within 15 to 600 s", () => {
    expect(adjustSetup(base, "restS", 1).restS).toBe(105);
    expect(adjustSetup({ ...base, restS: 15 }, "restS", -1).restS).toBe(15);
    expect(adjustSetup({ ...base, restS: 600 }, "restS", 1).restS).toBe(600);
  });

  it("does not change the other fields", () => {
    expect(adjustSetup(base, "sets", 1)).toEqual({ ...base, sets: 4 });
  });
});

describe("canAdjust", () => {
  it("is false at a limit in that direction", () => {
    expect(canAdjust({ ...base, sets: 10 }, "sets", 1)).toBe(false);
    expect(canAdjust({ ...base, sets: 10 }, "sets", -1)).toBe(true);
    expect(canAdjust({ ...base, repMin: 8, repMax: 8 }, "repMax", -1)).toBe(false);
  });
});
