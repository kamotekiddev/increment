import { bannerText } from "./bannerText";

describe("bannerText", () => {
  it("states the Target", () => {
    expect(bannerText({ weightKg: 62.5, reps: 8 }, { repMin: 8, repMax: 12 })).toBe("Target: 62.5 kg × 8");
  });

  it("drops trailing zeros on whole weights", () => {
    expect(bannerText({ weightKg: 60, reps: 10 }, null)).toBe("Target: 60 kg × 10");
  });

  it("asks a first-timer to pick a weight for the rep range", () => {
    expect(bannerText(null, { repMin: 8, repMax: 12 })).toBe("First time on this exercise. Pick a weight you can do for 8 to 12 reps.");
  });

  it("still gives a note when the rep range is unknown", () => {
    expect(bannerText(null, null)).toBe("First time on this exercise. Pick a weight you can do.");
  });
});
