import { initialSetRows } from "./initialSetRows";

describe("initialSetRows", () => {
  const planned = { sets: 3, repMin: 8, repMax: 12 };

  it("prefills every planned row with the Target weight and reps", () => {
    const rows = initialSetRows(planned, { weightKg: 60, reps: 10 });
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row).toEqual({ weightKg: 60, reps: 10, done: false, edited: false });
    }
  });

  it("leaves weight blank and starts reps at the bottom of the range with no Target", () => {
    const rows = initialSetRows(planned, null);
    expect(rows).toEqual([
      { weightKg: null, reps: 8, done: false, edited: false },
      { weightKg: null, reps: 8, done: false, edited: false },
      { weightKg: null, reps: 8, done: false, edited: false },
    ]);
  });
});
