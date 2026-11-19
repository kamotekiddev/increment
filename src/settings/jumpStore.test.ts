import { formatWithUnit } from "@/units";

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

describe("Jump display of an untouched lb lifter", () => {
  it("shows the Barbell Jump as 5 lb, not 5.51 lb, and + goes to 5.5 lb", () => {
    const store = createJumpStore(createTestDb());
    store.getState().load();
    const barbell = effectiveJumps(store.getState().saved, "lb").barbell;
    expect(formatWithUnit(barbell, "lb")).toBe("5 lb");
    expect(formatWithUnit(barbell, "lb")).not.toBe("5.51 lb");
    expect(formatWithUnit(stepJump(barbell, "lb", "up"), "lb")).toBe("5.5 lb");
  });

  it("switches an untouched row to the kg default, and keeps a changed one", () => {
    const store = createJumpStore(createTestDb());
    store.getState().load();
    store.getState().setJump("dumbbell", 1);
    const kg = effectiveJumps(store.getState().saved, "kg");
    const lb = effectiveJumps(store.getState().saved, "lb");
    expect(formatWithUnit(kg.barbell, "kg")).toBe("2.5 kg");
    expect(formatWithUnit(lb.barbell, "lb")).toBe("5 lb");
    expect(formatWithUnit(lb.dumbbell, "lb")).toBe("2.2 lb");
  });
});
