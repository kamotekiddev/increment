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

describe("each unit keeps its own Jumps", () => {
  it("a Jump changed in kg is used only in kg; lb keeps its own default", () => {
    const saved = { ...UNTOUCHED_JUMPS, kg: { ...UNTOUCHED_JUMPS.kg, dumbbell: 1 } };
    expect(effectiveJumps(saved, "kg").dumbbell).toBe(1);
    expect(formatWithUnit(effectiveJumps(saved, "lb").dumbbell, "lb")).toBe("5 lb");
  });

  it("a Jump changed in lb is used only in lb; kg keeps its own default", () => {
    const saved = { ...UNTOUCHED_JUMPS, lb: { ...UNTOUCHED_JUMPS.lb, barbell: toKg(10, "lb") } };
    expect(formatWithUnit(effectiveJumps(saved, "lb").barbell, "lb")).toBe("10 lb");
    expect(effectiveJumps(saved, "kg").barbell).toBe(2.5);
  });

  it("an lb lifter at 62.5 kg (137.79 lb, set in kg) with a 5 lb Barbell Jump stays at 140 lb or goes up to 145 lb, not by the 2.5 kg one", () => {
    const saved = {
      kg: { ...UNTOUCHED_JUMPS.kg, barbell: 2.5 },
      lb: { ...UNTOUCHED_JUMPS.lb, barbell: toKg(5, "lb") },
    };
    const t = { weightKg: 62.5, reps: 8 };
    const earned = [session("2026-01-26", t, [8, 8, 8]), session("2026-01-19", t, [8, 8, 8]), session("2026-01-12", t, [8, 8, 8])];
    expect(formatWeight(62.5, "lb")).toBe("137.79");
    const r = nextTarget(input(earned, { step: "weight" }, { unit: "lb", jumpKg: jumpKgFor("barbell", effectiveJumps(saved, "lb")) }));
    expect(formatWeight(r.target!.weightKg, "lb")).toBe("140");
    expect(formatWeight(r.proposal!.weightKg, "lb")).toBe("145");
  });
});

