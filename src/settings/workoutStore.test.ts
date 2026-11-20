import { createTestDb } from "../../test-support/testDb";
import { readUnit } from "./unitSetting";
import { readWorkoutSettings } from "./workoutSetting";
import { createWorkoutStore } from "./workoutStore";

describe("Workout settings store", () => {
  it("holds the defaults until loaded, then the saved values", () => {
    const db = createTestDb();
    const store = createWorkoutStore(db);
    expect(store.getState().defaultRestS).toBe(90);
    store.getState().load();
    store.getState().setDefaultRest(120);
    store.getState().setShowPreviousSet(false);
    store.getState().setKeepScreenAwake(false);

    const reopened = createWorkoutStore(db);
    reopened.getState().load();
    expect(reopened.getState()).toMatchObject({ defaultRestS: 120, showPreviousSet: false, keepScreenAwake: false });
  });

  it("saves a change, tells subscribers and leaves the unit alone", () => {
    const db = createTestDb();
    const store = createWorkoutStore(db);
    store.getState().load();
    const seen: number[] = [];
    store.subscribe((s) => seen.push(s.defaultRestS));
    store.getState().setDefaultRest(105);
    store.getState().setDefaultRest(120);
    expect(seen).toEqual([105, 120]);
    expect(readWorkoutSettings(db).defaultRestS).toBe(120);
    expect(readUnit(db)).toBe("kg");
  });
});
