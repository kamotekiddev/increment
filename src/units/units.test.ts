import {
  KG_PER_LB,
  convert,
  displayWeight,
  formatNumber,
  formatWeight,
  formatWithUnit,
  fromKg,
  loadableIn,
  loggedWeightText,
  loggedWeightWithUnit,
  roundToLoadable,
  toKg,
  weightKg,
} from "./index";

describe("formatWithUnit", () => {
  it("prints the weight and the unit label in kg", () => {
    expect(formatWithUnit(62.5, "kg")).toBe("62.5 kg");
    expect(formatWithUnit(60, "kg")).toBe("60 kg");
  });

  it("converts and labels in lb", () => {
    expect(formatWithUnit(60, "lb")).toBe("132.28 lb");
    expect(formatWithUnit(61.2349, "lb")).toBe("135 lb");
  });

  it("works for a workout volume", () => {
    expect(formatWithUnit(4200, "kg")).toBe("4200 kg");
    expect(formatWithUnit(4200, "lb")).toBe("9259.42 lb");
  });
});

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

describe("convert", () => {
  it("is the identity within one unit and exact across units", () => {
    expect(convert(62.5, "kg", "kg")).toBe(62.5);
    expect(convert(1, "lb", "kg")).toBe(0.45359237);
    expect(convert(100, "kg", "lb")).toBeCloseTo(220.462262, 6);
  });
});

describe("roundToLoadable", () => {
  it("goes to the nearest step, a tie rounding up", () => {
    expect(roundToLoadable(132.28, 5)).toBe(130);
    expect(roundToLoadable(220.46, 5)).toBe(220);
    expect(roundToLoadable(61.23, 2.5)).toBe(60);
    expect(roundToLoadable(132.5, 5)).toBe(135);
    expect(roundToLoadable(26.25, 2.5)).toBe(27.5);
  });
});

describe("loadableIn", () => {
  const lb5 = toKg(5, "lb");
  it("converts a weight saved in the other unit and rounds it to the Jump", () => {
    expect(loadableIn({ value: 100, unit: "kg" }, "lb", lb5)).toBe(220);
    expect(loadableIn({ value: 60, unit: "kg" }, "lb", lb5)).toBe(130);
    expect(loadableIn({ value: 135, unit: "lb" }, "kg", 2.5)).toBe(60);
  });
  it("returns a weight saved in the same unit exactly, off the Jump's grid or not", () => {
    expect(loadableIn({ value: 61.25, unit: "kg" }, "kg", 2.5)).toBe(61.25);
    expect(loadableIn({ value: 137, unit: "lb" }, "lb", lb5)).toBe(137);
  });
});

describe("formatNumber", () => {
  it("shows up to 2 decimals with trailing zeros dropped", () => {
    expect(formatNumber(60)).toBe("60");
    expect(formatNumber(62.5)).toBe("62.5");
    expect(formatNumber(61.25)).toBe("61.25");
    expect(formatNumber(61.234)).toBe("61.23");
  });
});

describe("loggedWeightText (history)", () => {
  it("shows a set saved in the current unit exactly", () => {
    expect(loggedWeightWithUnit({ value: 45, unit: "lb" }, "lb")).toBe("45 lb");
    expect(loggedWeightText({ value: 61.25, unit: "kg" }, "kg")).toBe("61.25");
  });
  it("shows a set saved in the other unit converted to 1 decimal with ≈, never rounded to a plate", () => {
    expect(loggedWeightWithUnit({ value: 45, unit: "lb" }, "kg")).toBe("≈20.4 kg");
    expect(loggedWeightWithUnit({ value: 100, unit: "kg" }, "lb")).toBe("≈220.5 lb");
    expect(loggedWeightText({ value: 135, unit: "lb" }, "kg")).toBe("≈61.2");
  });
});

describe("weightKg", () => {
  it("compares mixed units in kg in memory: 225 lb (102.06 kg) beats 100 kg", () => {
    const heavier = [{ value: 100, unit: "kg" as const }, { value: 225, unit: "lb" as const }].reduce((a, b) => (weightKg(b) > weightKg(a) ? b : a));
    expect(heavier).toEqual({ value: 225, unit: "lb" });
    expect(weightKg(heavier)).toBeCloseTo(102.06, 2);
  });
});
