import { userSettings } from "@/db/schema";

import { createTestDb } from "../../test-support/testDb";
import { readReminderSettings, writeRemindersOn, writeReminderTime } from "./reminderSetting";
import { readUnit, writeUnit } from "./unitSetting";
import { readWorkoutSettings, writeDefaultRest } from "./workoutSetting";

describe("Reminder settings", () => {
  it("a fresh database reads off and 1080 (6:00 PM)", () => {
    expect(readReminderSettings(createTestDb())).toEqual({ remindersOn: false, reminderTimeMin: 1080 });
  });

  it("a write reads back and touches no other column", () => {
    const db = createTestDb();
    writeUnit(db, "lb");
    writeDefaultRest(db, 120);
    writeRemindersOn(db, true);
    writeReminderTime(db, 390);
    expect(readReminderSettings(db)).toEqual({ remindersOn: true, reminderTimeMin: 390 });
    expect(readUnit(db)).toBe("lb");
    expect(readWorkoutSettings(db).defaultRestS).toBe(120);
  });

  it("one write leaves the other reminder setting alone", () => {
    const db = createTestDb();
    writeReminderTime(db, 600);
    expect(readReminderSettings(db)).toEqual({ remindersOn: false, reminderTimeMin: 600 });
  });

  it("repairs a stored time out of range on read", () => {
    const db = createTestDb();
    readReminderSettings(db);
    db.update(userSettings).set({ reminderTimeMin: 2000 }).run();
    expect(readReminderSettings(db).reminderTimeMin).toBe(1439);
    db.update(userSettings).set({ reminderTimeMin: -5 }).run();
    expect(readReminderSettings(db).reminderTimeMin).toBe(0);
  });
});
