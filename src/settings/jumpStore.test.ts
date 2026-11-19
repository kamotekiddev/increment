import { createTestDb } from "../../test-support/testDb";
import { createJumpStore } from "./jumpStore";
import { readJumps } from "./jumpSetting";

describe("Jump store", () => {
  it("holds the defaults until loaded, then the saved Jumps", () => {
    const db = createTestDb();
    const store = createJumpStore(db);
    expect(store.getState().jumps.dumbbell).toBe(2);
    store.getState().setJump("dumbbell", 1);

    const reopened = createJumpStore(db);
    reopened.getState().load();
    expect(reopened.getState().jumps).toEqual({ barbell: 2.5, dumbbell: 1, machine: 5, cable: 2.5, bodyweight: 2.5 });
  });

  it("saves a change and tells subscribers", () => {
    const db = createTestDb();
    const store = createJumpStore(db);
    store.getState().load();
    const seen: number[] = [];
    store.subscribe((s) => seen.push(s.jumps.machine));
    store.getState().setJump("machine", 2.5);
    store.getState().setJump("machine", 10);
    expect(seen).toEqual([2.5, 10]);
    expect(readJumps(db).machine).toBe(10);
  });
});
