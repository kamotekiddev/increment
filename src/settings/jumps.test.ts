import { nextTarget } from "@/engine";
import { input, session } from "@/engine/testing";
import { formatWeight, formatWithUnit, toKg } from "@/units";

import { DEFAULT_JUMPS_KG, effectiveJumps, JUMP_KEYS, jumpKeyFor, jumpKgFor, UNTOUCHED_JUMPS } from "./jumps";

describe("jumpKeyFor", () => {
  it.each([
    ["barbell", "barbell"],
    ["ez bar", "barbell"],
    ["dumbbell", "dumbbell"],
    ["kettlebell", "dumbbell"],
    ["machine", "machine"],
    ["cable", "cable"],
    ["bodyweight", "bodyweight"],
  ])("%s uses the %s Jump", (equipment, key) => {
    expect(jumpKeyFor(equipment)).toBe(key);
  });
});

describe("jumpKgFor", () => {
  it("looks up the Jump of the exercise's equipment", () => {
    const jumps = { ...DEFAULT_JUMPS_KG, dumbbell: 1 };
    expect(jumpKgFor("kettlebell", jumps)).toBe(1);
    expect(jumpKgFor("ez bar", jumps)).toBe(2.5);
  });

  it("has the defaults 2.5, 2, 5, 2.5 and 2.5 kg", () => {
    const expected = { barbell: 2.5, dumbbell: 2, machine: 5, cable: 2.5, bodyweight: 2.5 };
    expect(effectiveJumps(UNTOUCHED_JUMPS, "kg")).toEqual(expected);
    expect(DEFAULT_JUMPS_KG).toEqual(expected);
  });
});

describe("Targets step by the Jump of the equipment", () => {
  const earned = (weightKg: number) => {
    const t = { weightKg, reps: 8 };
    return [session("2026-01-26", t, [8, 8, 8]), session("2026-01-19", t, [8, 8, 8]), session("2026-01-12", t, [8, 8, 8])];
  };
  const missed = (weightKg: number) => {
    const t = { weightKg, reps: 8 };
    return [session("2026-01-26", t, [8, 8, 6]), session("2026-01-19", t, [8, 8, 6])];
  };
  const drop = { miss: { after: 2, action: { kind: "drop", percent: 10 } as const } };

  it.each([
    // equipment, current kg, step up to, after a 10% drop
    ["barbell", 60, 62.5, 52.5],
    ["dumbbell", 8, 10, 6],
    ["machine", 50, 55, 45],
    ["cable", 20, 22.5, 17.5],
    ["bodyweight", 10, 12.5, 7.5],
  ])("%s at %s kg steps up to %s kg and drops to %s kg", (equipment, current, up, dropped) => {
    const jumpKg = jumpKgFor(equipment, effectiveJumps(UNTOUCHED_JUMPS, "kg"));
    expect(nextTarget(input(earned(current), { step: "weight" }, { jumpKg })).proposal).toEqual({ weightKg: up, reps: 8 });
    expect(nextTarget(input(missed(current), drop, { jumpKg })).target).toEqual({ weightKg: dropped, reps: 8 });
  });
});

describe("an untouched Jump uses the default of the lifter's unit", () => {
  it("an untouched lb lifter's Barbell Jump is exactly 5 lb, and 135 lb steps to 140 lb", () => {
    const jumps = effectiveJumps(UNTOUCHED_JUMPS, "lb");
    expect(jumps.barbell).toBe(toKg(5, "lb"));
    expect(formatWeight(jumps.barbell, "lb")).toBe("5");
    const earned = [135, 135, 135].map((_, i) =>
      session(`2026-01-${26 - 7 * i}`, { weightKg: toKg(135, "lb"), reps: 8 }, [8, 8, 8]),
    );
    const r = nextTarget(input(earned, { step: "weight" }, { jumpKg: jumpKgFor("barbell", jumps) }));
    expect(formatWeight(r.proposal!.weightKg, "lb")).toBe("140");
  });

  it("has the lb defaults 5, 5, 10, 5 and 5 lb", () => {
    const jumps = effectiveJumps(UNTOUCHED_JUMPS, "lb");
    expect(JUMP_KEYS.map((key) => formatWithUnit(jumps[key], "lb"))).toEqual(["5 lb", "5 lb", "10 lb", "5 lb", "5 lb"]);
  });
});

describe("one Jump per equipment, shown in either unit as the nearest rung", () => {
  const savedBarbell = (kg: number) => ({ ...UNTOUCHED_JUMPS, barbell: kg });

  it("a 5 kg Barbell Jump shows as 10 lb in lb and exactly 5 kg in kg", () => {
    expect(effectiveJumps(savedBarbell(5), "lb").barbell).toBe(toKg(10, "lb"));
    expect(formatWithUnit(effectiveJumps(savedBarbell(5), "lb").barbell, "lb")).toBe("10 lb");
    expect(effectiveJumps(savedBarbell(5), "kg").barbell).toBe(5);
  });

  it.each([
    [2.5, "5 lb"],
    [1.25, "2.5 lb"],
    [2, "5 lb"],
    [10, "20 lb"],
  ])("%s kg shows as %s", (kg, shown) => {
    expect(formatWithUnit(effectiveJumps(savedBarbell(kg), "lb").barbell, "lb")).toBe(shown);
  });

  it.each([
    [15, "5 kg"],
    [10, "5 kg"],
    [5, "2.5 kg"],
    [2.5, "1.25 kg"],
  ])("%s lb shows as %s", (lb, shown) => {
    expect(formatWithUnit(effectiveJumps(savedBarbell(toKg(lb, "lb")), "kg").barbell, "kg")).toBe(shown);
  });

  it("a Jump halfway between two rungs shows as the higher one", () => {
    // 7.5 lb is halfway between the 5 and 10 lb rungs.
    expect(formatWithUnit(effectiveJumps(savedBarbell(toKg(7.5, "lb")), "lb").barbell, "lb")).toBe("10 lb");
  });

  it("changes only the Jump that was set: the others are the current unit's defaults", () => {
    const jumps = effectiveJumps(savedBarbell(5), "lb");
    expect(JUMP_KEYS.map((key) => formatWithUnit(jumps[key], "lb"))).toEqual(["10 lb", "5 lb", "10 lb", "5 lb", "5 lb"]);
  });

  it("an lb lifter with a 5 kg Barbell Jump steps by 10 lb: 140 lb goes up to 150 lb", () => {
    const t = { weightKg: toKg(140, "lb"), reps: 8 };
    const earned = [0, 1, 2].map((i) => session(`2026-01-${26 - 7 * i}`, t, [8, 8, 8], { unit: "lb" }));
    const jumpKg = jumpKgFor("barbell", effectiveJumps(savedBarbell(5), "lb"));
    const r = nextTarget(input(earned, { step: "weight" }, { unit: "lb", jumpKg }));
    expect(formatWeight(r.target!.weightKg, "lb")).toBe("140");
    expect(formatWeight(r.proposal!.weightKg, "lb")).toBe("150");
  });

  it("an lb lifter at 62.5 kg (137.79 lb, set in kg) with the untouched 5 lb Barbell Jump stays at 135 lb or goes up to 140 lb", () => {
    const t = { weightKg: 62.5, reps: 8 };
    const earned = [session("2026-01-26", t, [8, 8, 8]), session("2026-01-19", t, [8, 8, 8]), session("2026-01-12", t, [8, 8, 8])];
    expect(formatWeight(62.5, "lb")).toBe("137.79");
    const r = nextTarget(input(earned, { step: "weight" }, { unit: "lb", jumpKg: jumpKgFor("barbell", effectiveJumps(UNTOUCHED_JUMPS, "lb")) }));
    expect(formatWeight(r.target!.weightKg, "lb")).toBe("135");
    expect(formatWeight(r.proposal!.weightKg, "lb")).toBe("140");
  });
});
