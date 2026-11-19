import { formatWithUnit, toKg } from "@/units";

import { canStepJump, stepJump } from "./jumpStep";

describe("stepJump", () => {
  it("+ adds 0.5 kg for a kg lifter", () => {
    expect(stepJump(2.5, "kg", "up")).toBe(3);
  });

  it("− takes the Dumbbell default of 2 kg to 1 kg in two taps", () => {
    expect(stepJump(stepJump(2, "kg", "down"), "kg", "down")).toBe(1);
  });

  it("+ takes 5 lb to exactly 5.5 lb, saved in kg", () => {
    expect(stepJump(toKg(5, "lb"), "lb", "up")).toBe(toKg(5.5, "lb"));
  });

  it("lands an off-grid Jump on the lb grid: 2.5 kg (5.51 lb) goes to 6 lb or 5.5 lb", () => {
    expect(formatWithUnit(stepJump(2.5, "lb", "up"), "lb")).toBe("6 lb");
    expect(formatWithUnit(stepJump(2.5, "lb", "down"), "lb")).toBe("5.5 lb");
  });

  it.each(["kg", "lb"] as const)("ten + then ten − returns exactly to the start in %s", (unit) => {
    const start = toKg(5, unit);
    let kg = start;
    for (let i = 0; i < 10; i++) kg = stepJump(kg, unit, "up");
    expect(formatWithUnit(kg, unit)).toBe(`10 ${unit}`);
    for (let i = 0; i < 10; i++) kg = stepJump(kg, unit, "down");
    expect(kg).toBe(start);
  });
});

describe("Jump display", () => {
  it("shows a Jump in the lifter's unit", () => {
    expect(formatWithUnit(2.5, "kg")).toBe("2.5 kg");
    expect(formatWithUnit(toKg(5, "lb"), "lb")).toBe("5 lb");
    expect(formatWithUnit(toKg(5, "lb"), "kg")).toBe("2.27 kg");
  });
});

describe("bounds of − and +", () => {
  it.each(["kg", "lb"] as const)("− stops at 0.5 %s and never reaches 0", (unit) => {
    const min = toKg(0.5, unit);
    expect(canStepJump(toKg(1, unit), unit, "down")).toBe(true);
    expect(canStepJump(min, unit, "down")).toBe(false);
    expect(stepJump(min, unit, "down")).toBe(min);
  });

  it.each([
    ["kg", 25],
    ["lb", 50],
  ] as const)("+ stops at %s %s", (unit, max) => {
    expect(canStepJump(toKg(max - 0.5, unit), unit, "up")).toBe(true);
    expect(canStepJump(toKg(max, unit), unit, "up")).toBe(false);
    expect(stepJump(toKg(max, unit), unit, "up")).toBe(toKg(max, unit));
  });

  it("an off-grid Jump just above the minimum can still go down to it", () => {
    // 0.3 kg is 0.66 lb: − lands on 0.5 lb.
    expect(canStepJump(0.3, "lb", "down")).toBe(true);
    expect(formatWithUnit(stepJump(0.3, "lb", "down"), "lb")).toBe("0.5 lb");
  });
});
