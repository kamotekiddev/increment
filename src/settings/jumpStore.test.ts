import { formatWithUnit, toKg } from "@/units";

import { createTestDb } from "../../test-support/testDb";
import { createJumpStore } from "./jumpStore";
import { readJumps } from "./jumpSetting";
import { effectiveJumps, UNTOUCHED_JUMPS } from "./jumps";
import { stepJump } from "./jumpStep";

describe("Jump store", () => {
  it("holds untouched Jumps until loaded, then the saved Jumps", () => {
    const db = createTestDb();
    const store = createJumpStore(db);
    expect(store.getState().saved).toEqual(UNTOUCHED_JUMPS);
    store.getState().setJump("kg", "dumbbell", 1);

    const reopened = createJumpStore(db);
    reopened.getState().load();
    expect(reopened.getState().saved).toEqual({ ...UNTOUCHED_JUMPS, kg: { ...UNTOUCHED_JUMPS.kg, dumbbell: 1 } });
  });

  it("saves a change and tells subscribers", () => {
    const db = createTestDb();
    const store = createJumpStore(db);
    store.getState().load();
    const seen: (number | null)[] = [];
    store.subscribe((s) => seen.push(s.saved.kg.machine));
    store.getState().setJump("kg", "machine", 2.5);
    store.getState().setJump("kg", "machine", 10);
    expect(seen).toEqual([2.5, 10]);
    expect(readJumps(db).kg.machine).toBe(10);
  });
});

describe("Jump display per unit", () => {
  it("shows an untouched lb lifter's Barbell Jump as 5 lb, and + goes to 10 lb", () => {
    const store = createJumpStore(createTestDb());
    store.getState().load();
    const barbell = effectiveJumps(store.getState().saved, "lb").barbell;
    expect(formatWithUnit(barbell, "lb")).toBe("5 lb");
    expect(formatWithUnit(stepJump(barbell, "lb", "up"), "lb")).toBe("10 lb");
  });

  it("never converts one unit's Jump into the other: 2.5 kg and 5 lb stay as set", () => {
    const store = createJumpStore(createTestDb());
    store.getState().load();
    store.getState().setJump("kg", "barbell", 2.5);
    store.getState().setJump("lb", "barbell", toKg(5, "lb"));
    store.getState().setJump("kg", "dumbbell", 1);
    const kg = effectiveJumps(store.getState().saved, "kg");
    const lb = effectiveJumps(store.getState().saved, "lb");
    expect(formatWithUnit(kg.barbell, "kg")).toBe("2.5 kg");
    expect(formatWithUnit(lb.barbell, "lb")).toBe("5 lb");
    expect(formatWithUnit(kg.dumbbell, "kg")).toBe("1 kg");
    expect(formatWithUnit(lb.dumbbell, "lb")).toBe("5 lb");
  });
});
