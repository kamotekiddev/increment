import { toTodayInput, weekEnd, weekStart } from "./todayInput";

const at = (month: number, day: number, h = 0) => new Date(2026, month, day, h).getTime();

describe("weekStart / weekEnd", () => {
  it("starts on the Sunday at local midnight", () => {
    expect(weekStart(at(10, 18, 12))).toBe(at(10, 15)); // Wed 18 Nov -> Sun 15 Nov
    expect(weekEnd(at(10, 18, 12))).toBe(at(10, 22));
  });

  it("treats Sunday as the first day and Saturday night as the last", () => {
    expect(weekStart(at(10, 15, 0))).toBe(at(10, 15));
    expect(weekStart(at(10, 21, 23))).toBe(at(10, 15));
  });

  it("crosses month and year boundaries", () => {
    expect(weekStart(new Date(2026, 0, 1, 10).getTime())).toBe(new Date(2025, 11, 28).getTime());
    expect(weekEnd(new Date(2026, 0, 1, 10).getTime())).toBe(new Date(2026, 0, 4).getTime());
  });
});

describe("toTodayInput", () => {
  it("keeps only what the builder reads", () => {
    const input = toTodayInput(
      5,
      [{ id: 1, name: "Push", days: 3, position: 0 }],
      [{ routineId: 1, startedAt: 4 }],
      { routineId: null },
    );
    expect(input).toEqual({
      now: 5,
      routines: [{ id: 1, name: "Push", days: 3 }],
      finished: [{ routineId: 1, startedAt: 4 }],
      inProgress: { routineId: null },
    });
  });

  it("passes no in-progress workout through as null", () => {
    expect(toTodayInput(5, [], [], null).inProgress).toBeNull();
  });
});
