import { restLabel, setupSubtitle } from "./setupText";

describe("restLabel", () => {
  it("formats seconds as m:ss", () => {
    expect(restLabel(15)).toBe("0:15");
    expect(restLabel(90)).toBe("1:30");
    expect(restLabel(150)).toBe("2:30");
    expect(restLabel(600)).toBe("10:00");
  });
});

describe("setupSubtitle", () => {
  it("joins sets, rep range and rest", () => {
    expect(setupSubtitle({ sets: 4, repMin: 6, repMax: 8, restS: 150 })).toBe("4 sets · 6–8 reps · 2:30 rest");
  });

  it("uses the singular for one set and a single rep count when min equals max", () => {
    expect(setupSubtitle({ sets: 1, repMin: 5, repMax: 5, restS: 90 })).toBe("1 set · 5 reps · 1:30 rest");
    expect(setupSubtitle({ sets: 3, repMin: 1, repMax: 1, restS: 90 })).toBe("3 sets · 1 rep · 1:30 rest");
  });
});
