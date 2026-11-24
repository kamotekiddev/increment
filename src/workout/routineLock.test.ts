import { LOCK_MESSAGE, isBlockedByWorkout } from "./routineLock";

describe("isBlockedByWorkout", () => {
  it("locks the routine being trained", () => {
    expect(isBlockedByWorkout({ routineId: 3 }, 3)).toBe(true);
  });

  it("leaves other routines editable", () => {
    expect(isBlockedByWorkout({ routineId: 3 }, 4)).toBe(false);
  });

  it("locks nothing when no workout is in progress", () => {
    expect(isBlockedByWorkout(null, 3)).toBe(false);
  });

  it("locks nothing when the workout's routine was deleted", () => {
    expect(isBlockedByWorkout({ routineId: null }, 3)).toBe(false);
  });

  it("explains how to unlock", () => {
    expect(LOCK_MESSAGE).toBe("Finish or discard your workout first");
  });
});
