import { formatWithUnit, toKg } from "@/units";

import { createTestDb } from "../../test-support/testDb";
import { readJumps, writeJump } from "./jumpSetting";
import { effectiveJumps, UNTOUCHED_JUMPS } from "./jumps";
import { readUnit, writeUnit } from "./unitSetting";

const NULLS = { barbell: null, dumbbell: null, machine: null, cable: null, bodyweight: null };

const switchUnitTenTimes = (db: ReturnType<typeof createTestDb>) => {
  for (let i = 0; i < 10; i++) writeUnit(db, i % 2 === 0 ? "lb" : "kg");
};

describe("Jump setting", () => {
  it("saves nothing in either unit until the lifter changes a Jump", () => {
    const db = createTestDb();
    expect(readJumps(db)).toEqual({ kg: NULLS, lb: NULLS });
  });

  it("keeps a changed Jump and leaves the others and the unit alone", () => {
    const db = createTestDb();
    writeUnit(db, "lb");
    writeJump(db, "kg", "dumbbell", 1);
    expect(readJumps(db)).toEqual({ kg: { ...NULLS, dumbbell: 1 }, lb: NULLS });
    expect(readUnit(db)).toBe("lb");
  });

  it("setting a Jump in lb never changes the kg Jump, and back", () => {
    const db = createTestDb();
    writeJump(db, "kg", "barbell", 2.5);
    writeJump(db, "lb", "barbell", toKg(10, "lb"));
    writeJump(db, "lb", "barbell", toKg(5, "lb"));
    expect(readJumps(db).kg.barbell).toBe(2.5);
    writeJump(db, "kg", "barbell", 5);
    expect(readJumps(db).lb.barbell).toBe(toKg(5, "lb"));
  });

  it("reads Barbell 2.5 kg and 5 lb back at full precision after the unit is switched 10 times, and the untouched ones stay NULL", () => {
    const db = createTestDb();
    writeJump(db, "kg", "barbell", 2.5);
    writeJump(db, "lb", "barbell", toKg(5, "lb"));
    switchUnitTenTimes(db);
    // 5 × 0.45359237 in floating point, compared exactly: full precision, not 0.01.
    const saved = readJumps(db);
    expect(saved).toEqual({ kg: { ...NULLS, barbell: 2.5 }, lb: { ...NULLS, barbell: 2.2679618500000003 } });
    expect(formatWithUnit(effectiveJumps(saved, "kg").barbell, "kg")).toBe("2.5 kg");
    expect(formatWithUnit(effectiveJumps(saved, "lb").barbell, "lb")).toBe("5 lb");
  });

  it("switching the unit 10 times never saves a Jump", () => {
    const db = createTestDb();
    readJumps(db);
    switchUnitTenTimes(db);
    expect(readJumps(db)).toEqual(UNTOUCHED_JUMPS);
  });
});
