import { canCreateRoutine, FREE_ROUTINE_LIMIT, isRoutineLocked, lockedRoutineIds } from "./routineLimit";

describe("isRoutineLocked", () => {
  it("is true for the fourth routine on the free plan", () => {
    expect(isRoutineLocked(4, [1, 2, 3, 4], false)).toBe(true);
    expect(isRoutineLocked(3, [1, 2, 3, 4], false)).toBe(false);
  });

  it("is false with Pro, and false for a routine no longer in the list", () => {
    expect(isRoutineLocked(4, [1, 2, 3, 4], true)).toBe(false);
    expect(isRoutineLocked(9, [1, 2, 3], false)).toBe(false);
  });

  it("unlocks when an older routine is deleted", () => {
    expect(isRoutineLocked(4, [2, 3, 4], false)).toBe(false);
  });
});

describe("lockedRoutineIds", () => {
  it("locks the fourth routine on the free plan", () => {
    expect(lockedRoutineIds([1, 2, 3, 4], false)).toEqual([4]);
  });

  it("locks nothing with fewer than 4 routines", () => {
    expect(lockedRoutineIds([], false)).toEqual([]);
    expect(lockedRoutineIds([4, 9, 11], false)).toEqual([]);
  });

  it("keeps the 3 lowest ids open whatever order the list is in", () => {
    expect(lockedRoutineIds([7, 3, 5, 9], false).sort()).toEqual([9]);
    expect(lockedRoutineIds([9, 7, 5, 3], false).sort()).toEqual([9]);
  });

  it("unlocks the next routine when an older one is deleted", () => {
    expect(lockedRoutineIds([2, 3, 5, 6], false)).toEqual([6]);
    expect(lockedRoutineIds([3, 5, 6], false)).toEqual([]);
  });

  it("locks nothing with Pro", () => {
    expect(lockedRoutineIds([1, 2, 3, 4, 5], true)).toEqual([]);
    expect(lockedRoutineIds([5, 1, 4, 2, 3], true)).toEqual([]);
  });

  it.each([
    ["3 routines lock none", [[2, 5, 9], [9, 5, 2], [5, 9, 2]], []],
    ["4 routines lock the newest", [[2, 5, 9, 12], [12, 9, 5, 2], [9, 2, 12, 5]], [12]],
    ["5 routines lock the 2 newest", [[2, 5, 9, 12, 20], [20, 12, 9, 5, 2], [9, 20, 2, 12, 5]], [12, 20]],
  ] as const)("%s, in any list order", (_name, orders, expected) => {
    for (const order of orders) {
      expect([...lockedRoutineIds(order, false)].sort((a, b) => a - b)).toEqual(expected);
    }
  });

  it("unlocks the next routine when one of the 3 oldest is deleted, in any list order", () => {
    expect(lockedRoutineIds([12, 2, 20, 5, 9], false).sort((a, b) => a - b)).toEqual([12, 20]);
    expect(lockedRoutineIds([12, 20, 5, 9], false)).toEqual([20]);
    expect(lockedRoutineIds([20, 12, 9], false)).toEqual([]);
  });

  it("does not change the input", () => {
    const ids = [4, 1, 2, 3];
    lockedRoutineIds(ids, false);
    expect(ids).toEqual([4, 1, 2, 3]);
  });
});

describe("canCreateRoutine", () => {
  it("allows a routine with 0, 1 or 2 routines on the free plan", () => {
    expect(canCreateRoutine(0, false)).toBe(true);
    expect(canCreateRoutine(1, false)).toBe(true);
    expect(canCreateRoutine(2, false)).toBe(true);
  });

  it("blocks a routine with 3 or more on the free plan", () => {
    expect(canCreateRoutine(3, false)).toBe(false);
    expect(canCreateRoutine(4, false)).toBe(false);
  });

  it("always allows a routine with Pro", () => {
    expect(canCreateRoutine(3, true)).toBe(true);
    expect(canCreateRoutine(50, true)).toBe(true);
  });

  it("sets the free limit to 3", () => {
    expect(FREE_ROUTINE_LIMIT).toBe(3);
  });
});
