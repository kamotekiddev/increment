import { LOCK_MESSAGE, isRoutineLocked } from "./routineLock";

describe("isRoutineLocked", () => {
  it("locks the routine being trained", () => {
    expect(isRoutineLocked({ routineId: 3 }, 3)).toBe(true);
  });

  it("leaves other routines editable", () => {
    expect(isRoutineLocked({ routineId: 3 }, 4)).toBe(false);
  });

  it("locks nothing when no workout is in progress", () => {
    expect(isRoutineLocked(null, 3)).toBe(false);
  });

  it("locks nothing when the workout's routine was deleted", () => {
    expect(isRoutineLocked({ routineId: null }, 3)).toBe(false);
  });

  it("explains how to unlock", () => {
    expect(LOCK_MESSAGE).toBe("Finish or discard your workout first");
  });
});
