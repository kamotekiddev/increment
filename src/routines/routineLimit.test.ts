import { canCreateRoutine, FREE_ROUTINE_LIMIT } from "./routineLimit";

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
