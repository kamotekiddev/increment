import { formatWithUnit, toKg } from "@/units";

import { canStepJump, stepJump } from "./jumpStep";

/** Taps + (or −) `taps` times from `start` (in the unit) and returns each value shown, in the unit. */
const walk = (start: number, unit: "kg" | "lb", direction: "up" | "down", taps: number) => {
  let kg = toKg(start, unit);
  const shown: string[] = [];
  for (let i = 0; i < taps; i++) {
    kg = stepJump(kg, unit, direction);
    shown.push(formatWithUnit(kg, unit));
  }
  return shown;
};

describe("the kg ladder", () => {
  it("+ climbs 0.5, 1, 1.25, 2, 2.5, 5, 10 kg", () => {
    expect(walk(0.5, "kg", "up", 6)).toEqual(["1 kg", "1.25 kg", "2 kg", "2.5 kg", "5 kg", "10 kg"]);
  });

  it("− walks the same rungs back down to 0.5 kg", () => {
    expect(walk(10, "kg", "down", 6)).toEqual(["5 kg", "2.5 kg", "2 kg", "1.25 kg", "1 kg", "0.5 kg"]);
  });
});

describe("the lb ladder", () => {
  it("+ climbs 1.25, 2.5, 5, 10, 15, 20 lb", () => {
    expect(walk(1.25, "lb", "up", 5)).toEqual(["2.5 lb", "5 lb", "10 lb", "15 lb", "20 lb"]);
  });

  it("− walks the same rungs back down to 1.25 lb", () => {
    expect(walk(20, "lb", "down", 5)).toEqual(["15 lb", "10 lb", "5 lb", "2.5 lb", "1.25 lb"]);
  });

  it("5 lb + gives exactly 10 lb, saved in kg", () => {
    expect(stepJump(toKg(5, "lb"), "lb", "up")).toBe(toKg(10, "lb"));
  });

  it("5 lb − gives exactly 2.5 lb, saved in kg", () => {
    expect(stepJump(toKg(5, "lb"), "lb", "down")).toBe(toKg(2.5, "lb"));
  });

  it("never shows 5.5 or 6 lb", () => {
    expect(walk(1.25, "lb", "up", 5)).not.toContain("5.5 lb");
    expect(walk(1.25, "lb", "up", 5)).not.toContain("6 lb");
  });
});

describe("an off-ladder Jump snaps to the next rung", () => {
  it("5.51 lb goes up to 10 lb and down to 5 lb", () => {
    const offLadder = toKg(5.51, "lb");
    expect(formatWithUnit(stepJump(offLadder, "lb", "up"), "lb")).toBe("10 lb");
    expect(stepJump(offLadder, "lb", "down")).toBe(toKg(5, "lb"));
  });

  it("1.5 kg goes up to 2 kg and down to 1.25 kg", () => {
    expect(stepJump(1.5, "kg", "up")).toBe(2);
    expect(stepJump(1.5, "kg", "down")).toBe(1.25);
  });

  it("3 kg goes up to 5 kg and down to 2.5 kg", () => {
    expect(stepJump(3, "kg", "up")).toBe(5);
    expect(stepJump(3, "kg", "down")).toBe(2.5);
  });
});

describe("stepJump round trip", () => {
  it("six + from 0.5 kg then six − returns exactly to 0.5 kg", () => {
    let kg = 0.5;
    for (let i = 0; i < 6; i++) kg = stepJump(kg, "kg", "up");
    expect(kg).toBe(10);
    for (let i = 0; i < 6; i++) kg = stepJump(kg, "kg", "down");
    expect(kg).toBe(0.5);
  });

  it("five + from 1.25 lb then five − returns exactly to 1.25 lb", () => {
    const start = toKg(1.25, "lb");
    let kg = start;
    for (let i = 0; i < 5; i++) kg = stepJump(kg, "lb", "up");
    expect(formatWithUnit(kg, "lb")).toBe("20 lb");
    for (let i = 0; i < 5; i++) kg = stepJump(kg, "lb", "down");
    expect(kg).toBe(start);
  });
});

describe("bounds of − and +", () => {
  it.each([
    ["kg", 0.5, 1],
    ["lb", 1.25, 2.5],
  ] as const)("− stops at %s %s and never reaches 0", (unit, min, aboveMin) => {
    expect(canStepJump(toKg(aboveMin, unit), unit, "down")).toBe(true);
    expect(canStepJump(toKg(min, unit), unit, "down")).toBe(false);
    expect(stepJump(toKg(min, unit), unit, "down")).toBe(toKg(min, unit));
  });

  it.each([
    ["kg", 10, 5],
    ["lb", 20, 15],
  ] as const)("+ stops at %s %s", (unit, max, belowMax) => {
    expect(canStepJump(toKg(belowMax, unit), unit, "up")).toBe(true);
    expect(canStepJump(toKg(max, unit), unit, "up")).toBe(false);
    expect(stepJump(toKg(max, unit), unit, "up")).toBe(toKg(max, unit));
  });

  it("an off-ladder Jump just above the bottom can still go down to it", () => {
    // 0.7 kg is 1.54 lb: − lands on 1.25 lb.
    expect(canStepJump(0.7, "lb", "down")).toBe(true);
    expect(formatWithUnit(stepJump(0.7, "lb", "down"), "lb")).toBe("1.25 lb");
  });

  it("an off-ladder Jump below the bottom can come up to it, but not go down", () => {
    // 0.5 lb is below the 1.25 lb bottom rung.
    expect(canStepJump(toKg(0.5, "lb"), "lb", "down")).toBe(false);
    expect(formatWithUnit(stepJump(toKg(0.5, "lb"), "lb", "up"), "lb")).toBe("1.25 lb");
  });

  it("a Jump above the top of the ladder can come down to it", () => {
    // 25 kg is above the 10 kg top: − lands on 10 kg, + does nothing.
    expect(canStepJump(25, "kg", "up")).toBe(false);
    expect(stepJump(25, "kg", "down")).toBe(10);
  });
});
