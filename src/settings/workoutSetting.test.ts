import { userSettings } from "@/db/schema";

import { createTestDb } from "../../test-support/testDb";
import { readJumps, writeJump } from "./jumpSetting";
import { readUnit, writeUnit } from "./unitSetting";
import { readWorkoutSettings, writeDefaultRest, writeKeepScreenAwake, writeShowPreviousSet } from "./workoutSetting";

describe("Workout settings", () => {
  it("a fresh database reads 90 s, on, on", () => {
    expect(readWorkoutSettings(createTestDb())).toEqual({ defaultRestS: 90, showPreviousSet: true, keepScreenAwake: true });
  });

  it("a write reads back and touches no other column", () => {
    const db = createTestDb();
    writeUnit(db, "lb");
    writeJump(db, "barbell", 5);
    writeDefaultRest(db, 120);
    writeShowPreviousSet(db, false);
    writeKeepScreenAwake(db, false);
    expect(readWorkoutSettings(db)).toEqual({ defaultRestS: 120, showPreviousSet: false, keepScreenAwake: false });
    expect(readUnit(db)).toBe("lb");
    expect(readJumps(db).barbell).toBe(5);
  });

  it("one write leaves the other two Workout settings alone", () => {
    const db = createTestDb();
    writeDefaultRest(db, 45);
    expect(readWorkoutSettings(db)).toEqual({ defaultRestS: 45, showPreviousSet: true, keepScreenAwake: true });
  });

  it("repairs a stored Default rest that is out of range on read", () => {
    const db = createTestDb();
    readWorkoutSettings(db);
    db.update(userSettings).set({ defaultRestS: 5000 }).run();
    expect(readWorkoutSettings(db).defaultRestS).toBe(600);
    db.update(userSettings).set({ defaultRestS: 0 }).run();
    expect(readWorkoutSettings(db).defaultRestS).toBe(15);
  });
});
