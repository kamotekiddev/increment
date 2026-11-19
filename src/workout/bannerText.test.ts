import { bannerText } from "./bannerText";

describe("bannerText", () => {
  it("states the Target", () => {
    expect(bannerText({ weightKg: 62.5, reps: 8 }, { repMin: 8, repMax: 12 }, "kg", "weighted")).toBe("Target: 62.5 kg × 8");
  });

  it("states the Target in lb", () => {
    expect(bannerText({ weightKg: 60, reps: 10 }, null, "lb", "weighted")).toBe("Target: 132.28 lb × 10");
    expect(bannerText({ weightKg: 61.2349, reps: 5 }, null, "lb", "weighted")).toBe("Target: 135 lb × 5");
  });

  it("drops trailing zeros on whole weights", () => {
    expect(bannerText({ weightKg: 60, reps: 10 }, null, "kg", "weighted")).toBe("Target: 60 kg × 10");
  });

  it("asks a first-timer to pick a weight for the rep range", () => {
    expect(bannerText(null, { repMin: 8, repMax: 12 }, "kg", "weighted")).toBe("First time on this exercise. Pick a weight you can do for 8 to 12 reps.");
  });

  it("still gives a note when the rep range is unknown", () => {
    expect(bannerText(null, null, "kg", "weighted")).toBe("First time on this exercise. Pick a weight you can do.");
  });
});

describe("bannerText on a bodyweight exercise", () => {
  it("states the Target in reps only", () => {
    expect(bannerText({ weightKg: 0, reps: 9 }, { repMin: 8, repMax: 12 }, "lb", "bodyweight")).toBe("Target: 9 reps");
  });

  it("never shows a weight, even one stored before the split", () => {
    expect(bannerText({ weightKg: 20, reps: 8 }, null, "kg", "bodyweight")).toBe("Target: 8 reps");
  });

  it("asks a first-timer for reps, not a weight", () => {
    expect(bannerText(null, { repMin: 8, repMax: 12 }, "kg", "bodyweight")).toBe("First time on this exercise. Aim for 8 to 12 reps.");
    expect(bannerText(null, null, "kg", "bodyweight")).toBe("First time on this exercise. Log the reps you do.");
  });
});
