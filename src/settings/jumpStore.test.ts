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
    store.getState().setJump("dumbbell", 1);

    const reopened = createJumpStore(db);
    reopened.getState().load();
    expect(reopened.getState().saved).toEqual({ ...UNTOUCHED_JUMPS, dumbbell: 1 });
  });

  it("saves a change and tells subscribers", () => {
    const db = createTestDb();
    const store = createJumpStore(db);
    store.getState().load();
    const seen: (number | null)[] = [];
    store.subscribe((s) => seen.push(s.saved.machine));
    store.getState().setJump("machine", 2.5);
    store.getState().setJump("machine", 10);
    expect(seen).toEqual([2.5, 10]);
    expect(readJumps(db).machine).toBe(10);
  });
});

describe("− / + on the Weight jumps screen", () => {
  it("shows an untouched lb lifter's Barbell Jump as 5 lb, and + goes to 10 lb", () => {
    const store = createJumpStore(createTestDb());
    store.getState().load();
    const barbell = effectiveJumps(store.getState().saved, "lb").barbell;
    expect(formatWithUnit(barbell, "lb")).toBe("5 lb");
    expect(formatWithUnit(stepJump(barbell, "lb", "up"), "lb")).toBe("10 lb");
  });

  it("in lb, + from a 5 kg Barbell Jump (shown 10 lb) saves 15 lb in kg, which shows as 5 kg back in kg", () => {
    const db = createTestDb();
    const store = createJumpStore(db);
    store.getState().load();
    store.getState().setJump("barbell", 5);
    const inLb = effectiveJumps(store.getState().saved, "lb").barbell;
    expect(formatWithUnit(inLb, "lb")).toBe("10 lb");
    store.getState().setJump("barbell", stepJump(inLb, "lb", "up"));
    expect(readJumps(db).barbell).toBe(toKg(15, "lb"));
    expect(formatWithUnit(effectiveJumps(store.getState().saved, "lb").barbell, "lb")).toBe("15 lb");
    expect(formatWithUnit(effectiveJumps(store.getState().saved, "kg").barbell, "kg")).toBe("5 kg");
  });
});
