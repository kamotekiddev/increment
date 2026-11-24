import { canCreateRoutine, FREE_ROUTINE_LIMIT, lockedRoutineIds } from "./routineLimit";

describe("lockedRoutineIds", () => {
  it("locks the third routine on the free plan", () => {
    expect(lockedRoutineIds([1, 2, 3], false)).toEqual([3]);
  });

  it("locks nothing with fewer than 3 routines", () => {
    expect(lockedRoutineIds([], false)).toEqual([]);
    expect(lockedRoutineIds([4, 9], false)).toEqual([]);
  });

  it("keeps the 2 lowest ids open whatever order the list is in", () => {
    expect(lockedRoutineIds([7, 3, 5, 9], false).sort()).toEqual([7, 9]);
    expect(lockedRoutineIds([9, 7, 5, 3], false).sort()).toEqual([7, 9]);
  });

  it("unlocks the next routine when an older one is deleted", () => {
    expect(lockedRoutineIds([2, 3, 5], false)).toEqual([5]);
    expect(lockedRoutineIds([3, 5], false)).toEqual([]);
  });

  it("locks nothing with Pro", () => {
    expect(lockedRoutineIds([1, 2, 3, 4], true)).toEqual([]);
  });

  it("does not change the input", () => {
    const ids = [3, 1, 2];
    lockedRoutineIds(ids, false);
    expect(ids).toEqual([3, 1, 2]);
  });
});

describe("canCreateRoutine", () => {
  it("allows a second routine on the free plan", () => {
    expect(canCreateRoutine(1, false)).toBe(true);
  });

  it("blocks a third routine on the free plan", () => {
    expect(canCreateRoutine(2, false)).toBe(false);
  });

  it("allows a third routine with Pro", () => {
    expect(canCreateRoutine(2, true)).toBe(true);
    expect(canCreateRoutine(50, true)).toBe(true);
  });

  it("exposes the free limit of 2 for the counter", () => {
    expect(FREE_ROUTINE_LIMIT).toBe(2);
  });
});
