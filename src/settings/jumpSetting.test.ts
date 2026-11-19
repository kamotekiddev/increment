import { toKg } from "@/units";

import { createTestDb } from "../../test-support/testDb";
import { readJumps, writeJump } from "./jumpSetting";
import { readUnit, writeUnit } from "./unitSetting";

describe("Jump setting", () => {
  it("starts at the defaults", () => {
    const db = createTestDb();
    expect(readJumps(db)).toEqual({ barbell: 2.5, dumbbell: 2, machine: 5, cable: 2.5, bodyweight: 2.5 });
  });

  it("keeps a changed Jump and leaves the others and the unit alone", () => {
    const db = createTestDb();
    writeUnit(db, "lb");
    writeJump(db, "dumbbell", 1);
    expect(readJumps(db)).toEqual({ barbell: 2.5, dumbbell: 1, machine: 5, cable: 2.5, bodyweight: 2.5 });
    expect(readUnit(db)).toBe("lb");
  });

  it("reads a 5 lb Jump back at full precision after the unit is switched 10 times", () => {
    const db = createTestDb();
    writeJump(db, "barbell", toKg(5, "lb"));
    for (let i = 0; i < 10; i++) writeUnit(db, i % 2 === 0 ? "kg" : "lb");
    // 5 × 0.45359237 in floating point, compared exactly: full precision, not 0.01.
    expect(readJumps(db).barbell).toBe(2.2679618500000003);
  });
});
