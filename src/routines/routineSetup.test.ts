import {
  clampRepMax,
  clampRepMin,
  clampRest,
  clampSets,
  DEFAULT_SETUP,
  SETUP_LIMITS,
} from "./routineSetup";

describe("setup defaults", () => {
  it("are 3 sets, 8 to 12 reps, 90 s rest", () => {
    expect(DEFAULT_SETUP).toEqual({ sets: 3, repMin: 8, repMax: 12, restS: 90 });
  });
});

describe("clampSets", () => {
  it("keeps sets within 1 to 10", () => {
    expect(clampSets(0)).toBe(1);
    expect(clampSets(1)).toBe(1);
    expect(clampSets(10)).toBe(10);
    expect(clampSets(11)).toBe(10);
  });
});

describe("clampRepMin", () => {
  it("keeps rep min within 1 to 30", () => {
    expect(clampRepMin(0, 12)).toBe(1);
    expect(clampRepMin(31, 40)).toBe(30);
  });

  it("never goes above the current rep max", () => {
    expect(clampRepMin(13, 12)).toBe(12);
    expect(clampRepMin(12, 12)).toBe(12);
  });
});

describe("clampRepMax", () => {
  it("keeps rep max at least rep min and at most 30", () => {
    expect(clampRepMax(7, 8)).toBe(8);
    expect(clampRepMax(8, 8)).toBe(8);
    expect(clampRepMax(30, 8)).toBe(30);
    expect(clampRepMax(31, 8)).toBe(30);
  });
});

describe("clampRest", () => {
  it("keeps rest within 15 to 600 s", () => {
    expect(clampRest(0)).toBe(15);
    expect(clampRest(600)).toBe(600);
    expect(clampRest(700)).toBe(600);
  });

  it("snaps to 15 s steps", () => {
    expect(clampRest(90)).toBe(90);
    expect(clampRest(100)).toBe(105);
    expect(clampRest(97)).toBe(90);
  });

  it("exposes the step", () => {
    expect(SETUP_LIMITS.restStepS).toBe(15);
  });
});
