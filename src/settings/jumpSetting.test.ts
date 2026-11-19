import { formatWithUnit } from "@/units";

import { createTestDb } from "../../test-support/testDb";
import { readJumps, writeJump } from "./jumpSetting";
import { effectiveJumps, UNTOUCHED_JUMPS } from "./jumps";
import { readUnit, writeUnit } from "./unitSetting";

const switchUnitTenTimes = (db: ReturnType<typeof createTestDb>) => {
  for (let i = 0; i < 10; i++) writeUnit(db, i % 2 === 0 ? "lb" : "kg");
};

/** What the screen shows for the Barbell Jump in the unit saved on the row. */
const shownBarbell = (db: ReturnType<typeof createTestDb>) => {
  const unit = readUnit(db);
  return formatWithUnit(effectiveJumps(readJumps(db), unit).barbell, unit);
};

describe("Jump setting", () => {
  it("saves nothing until the lifter changes a Jump", () => {
    const db = createTestDb();
    expect(readJumps(db)).toEqual(UNTOUCHED_JUMPS);
  });

  it("keeps a changed Jump and leaves the others and the unit alone", () => {
    const db = createTestDb();
    writeUnit(db, "lb");
    writeJump(db, "dumbbell", 1);
    expect(readJumps(db)).toEqual({ ...UNTOUCHED_JUMPS, dumbbell: 1 });
    expect(readUnit(db)).toBe("lb");
  });

  it("a 5 kg Barbell Jump shows as 10 lb after a switch to lb and 5 kg after the switch back", () => {
    const db = createTestDb();
    writeJump(db, "barbell", 5);
    expect(shownBarbell(db)).toBe("5 kg");
    writeUnit(db, "lb");
    expect(shownBarbell(db)).toBe("10 lb");
    writeUnit(db, "kg");
    expect(shownBarbell(db)).toBe("5 kg");
  });

  it("keeps exactly 5 kg after the unit is switched 10 times, and the untouched Jumps stay NULL", () => {
    const db = createTestDb();
    writeJump(db, "barbell", 5);
    switchUnitTenTimes(db);
    expect(readJumps(db)).toEqual({ ...UNTOUCHED_JUMPS, barbell: 5 });
  });

  it("an untouched Jump shows 5 lb in lb and 2.5 kg in kg, and stays NULL after 10 switches", () => {
    const db = createTestDb();
    readJumps(db);
    writeUnit(db, "lb");
    expect(shownBarbell(db)).toBe("5 lb");
    writeUnit(db, "kg");
    expect(shownBarbell(db)).toBe("2.5 kg");
    switchUnitTenTimes(db);
    expect(readJumps(db)).toEqual(UNTOUCHED_JUMPS);
  });
});
