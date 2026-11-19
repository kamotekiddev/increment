import { toKg } from "@/units";

import { createTestDb } from "../../test-support/testDb";
import { readJumps, writeJump } from "./jumpSetting";
import { UNTOUCHED_JUMPS } from "./jumps";
import { readUnit, writeUnit } from "./unitSetting";

const switchUnitTenTimes = (db: ReturnType<typeof createTestDb>) => {
  for (let i = 0; i < 10; i++) writeUnit(db, i % 2 === 0 ? "lb" : "kg");
};

describe("Jump setting", () => {
  it("saves nothing until the lifter changes a Jump", () => {
    const db = createTestDb();
    expect(readJumps(db)).toEqual({ barbell: null, dumbbell: null, machine: null, cable: null, bodyweight: null });
  });

  it("keeps a changed Jump and leaves the others and the unit alone", () => {
    const db = createTestDb();
    writeUnit(db, "lb");
    writeJump(db, "dumbbell", 1);
    expect(readJumps(db)).toEqual({ ...UNTOUCHED_JUMPS, dumbbell: 1 });
    expect(readUnit(db)).toBe("lb");
  });

  it("reads a 5 lb Jump back at full precision after the unit is switched 10 times, and the untouched ones stay NULL", () => {
    const db = createTestDb();
    writeJump(db, "barbell", toKg(5, "lb"));
    switchUnitTenTimes(db);
    // 5 × 0.45359237 in floating point, compared exactly: full precision, not 0.01.
    expect(readJumps(db)).toEqual({ ...UNTOUCHED_JUMPS, barbell: 2.2679618500000003 });
  });

  it("switching the unit 10 times never saves a Jump", () => {
    const db = createTestDb();
    readJumps(db);
    switchUnitTenTimes(db);
    expect(readJumps(db)).toEqual(UNTOUCHED_JUMPS);
  });
});
