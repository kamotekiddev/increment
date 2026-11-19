import { formatWithUnit, toKg } from "@/units";

import { canStepJump, JUMP_LADDER, stepJump } from "./jumpStep";

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

describe("the Jump ladder", () => {
  it.each(["kg", "lb"] as const)("+ climbs 0.5, 1, 1.25, 1.5, 2, 2.5, 3, then every 0.5, in %s", (unit) => {
    expect(walk(0.5, unit, "up", 8)).toEqual(["1", "1.25", "1.5", "2", "2.5", "3", "3.5", "4"].map((v) => `${v} ${unit}`));
  });

  it.each(["kg", "lb"] as const)("− walks the same ladder down to 0.5 %s", (unit) => {
    expect(walk(3, unit, "down", 6)).toEqual(["2.5", "2", "1.5", "1.25", "1", "0.5"].map((v) => `${v} ${unit}`));
  });

  it("is the same in kg and lb, ending at 25 kg and 50 lb", () => {
    expect(JUMP_LADDER.kg.slice(0, 8)).toEqual([0.5, 1, 1.25, 1.5, 2, 2.5, 3, 3.5]);
    expect(JUMP_LADDER.lb.slice(0, JUMP_LADDER.kg.length)).toEqual(JUMP_LADDER.kg);
    expect(JUMP_LADDER.kg.at(-1)).toBe(25);
    expect(JUMP_LADDER.lb.at(-1)).toBe(50);
  });
});

describe("stepJump", () => {
  it("+ takes 2.5 kg to 3 kg", () => {
    expect(stepJump(2.5, "kg", "up")).toBe(3);
  });

  it("− takes the Dumbbell default of 2 kg to 1 kg in three taps, through 1.5 and 1.25", () => {
    expect(walk(2, "kg", "down", 3)).toEqual(["1.5 kg", "1.25 kg", "1 kg"]);
  });

  it("+ takes 1 lb to exactly 1.25 lb, saved in kg", () => {
    expect(stepJump(toKg(1, "lb"), "lb", "up")).toBe(toKg(1.25, "lb"));
  });

  it("+ takes 5 lb to exactly 5.5 lb, saved in kg", () => {
    expect(stepJump(toKg(5, "lb"), "lb", "up")).toBe(toKg(5.5, "lb"));
  });

  it("lands an off-ladder Jump on the ladder: 2.5 kg (5.51 lb) goes to 6 lb or 5.5 lb", () => {
    expect(formatWithUnit(stepJump(2.5, "lb", "up"), "lb")).toBe("6 lb");
    expect(formatWithUnit(stepJump(2.5, "lb", "down"), "lb")).toBe("5.5 lb");
  });

  it("lands an off-ladder Jump between 1 and 1.25 on the nearest rung each way", () => {
    expect(stepJump(1.1, "kg", "up")).toBe(1.25);
    expect(stepJump(1.1, "kg", "down")).toBe(1);
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

  it("an off-ladder Jump just above the minimum can still go down to it", () => {
    // 0.3 kg is 0.66 lb: − lands on 0.5 lb.
    expect(canStepJump(0.3, "lb", "down")).toBe(true);
    expect(formatWithUnit(stepJump(0.3, "lb", "down"), "lb")).toBe("0.5 lb");
  });

  it("a Jump above the top of the ladder can come down to it", () => {
    // 25 kg is 55.12 lb, above the 50 lb top: − lands on 50 lb, + does nothing.
    expect(canStepJump(25, "lb", "up")).toBe(false);
    expect(formatWithUnit(stepJump(25, "lb", "down"), "lb")).toBe("50 lb");
  });
});
