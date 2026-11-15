import { KG_PER_LB, displayWeight, formatWeight, fromKg, toKg } from "./index";

describe("units", () => {
  it("uses the exact pound definition", () => {
    expect(KG_PER_LB).toBe(0.45359237);
    expect(toKg(1, "lb")).toBe(0.45359237);
    expect(toKg(100, "kg")).toBe(100);
  });

  it("shows a lb entry exactly as typed", () => {
    for (const lb of [45, 95, 135, 185, 225, 315, 2.5, 5, 12.5]) {
      expect(displayWeight(toKg(lb, "lb"), "lb")).toBe(lb);
    }
  });

  it("shows kg entries exactly as typed", () => {
    for (const kg of [20, 22.5, 60, 62.5, 100, 142.5]) {
      expect(displayWeight(toKg(kg, "kg"), "kg")).toBe(kg);
    }
  });

  it("drops trailing zeros and rounds to 0.01", () => {
    expect(formatWeight(60, "kg")).toBe("60");
    expect(formatWeight(62.5, "kg")).toBe("62.5");
    expect(formatWeight(toKg(135, "lb"), "lb")).toBe("135");
    expect(formatWeight(60, "lb")).toBe("132.28");
  });

  it("never changes the stored kg value when switching units back and forth", () => {
    const stored = toKg(135, "lb");
    const snapshot = stored;
    let shown = "";
    for (let i = 0; i < 1000; i++) {
      shown = formatWeight(stored, i % 2 === 0 ? "kg" : "lb");
    }
    expect(stored).toBe(snapshot);
    expect(formatWeight(stored, "lb")).toBe("135");
    expect(shown).toBeDefined();
  });

  it("round-trips kg -> lb -> kg within display precision", () => {
    for (let kg = 0; kg <= 300; kg += 0.25) {
      const lbShown = displayWeight(kg, "lb");
      const backKg = toKg(lbShown, "lb");
      expect(Math.abs(backKg - kg)).toBeLessThan(0.005 * KG_PER_LB + 1e-9);
      expect(fromKg(kg, "kg")).toBe(kg);
    }
  });

  it("does not produce negative zero", () => {
    expect(Object.is(displayWeight(-0.0001, "kg"), 0)).toBe(true);
  });
});
