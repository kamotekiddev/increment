import { toKg } from "../units";
import { initialSetRows } from "./initialSetRows";

describe("initialSetRows", () => {
  const planned = { sets: 3, repMin: 8, repMax: 12 };

  it("prefills every planned row with the Target weight and reps, in the lifter's unit", () => {
    const rows = initialSetRows(planned, { weightKg: 60, reps: 10 }, "kg");
    expect(rows).toHaveLength(3);
    for (const row of rows) {
      expect(row).toEqual({ weight: 60, unit: "kg", reps: 10, done: false, edited: false });
    }
  });

  it("prefills a lb lifter with the Target as a lb number, without float noise", () => {
    const [row] = initialSetRows(planned, { weightKg: toKg(140, "lb"), reps: 8 }, "lb");
    expect(row).toEqual({ weight: 140, unit: "lb", reps: 8, done: false, edited: false });
  });

  it("never rounds a Target again: a 12.5 kg baseline with a 2 kg Jump stays 12.5", () => {
    expect(initialSetRows(planned, { weightKg: 12.5, reps: 8 }, "kg")[0].weight).toBe(12.5);
  });

  it("leaves weight blank and starts reps at the bottom of the range with no Target", () => {
    const rows = initialSetRows(planned, null, "lb");
    expect(rows).toEqual([
      { weight: null, unit: "lb", reps: 8, done: false, edited: false },
      { weight: null, unit: "lb", reps: 8, done: false, edited: false },
      { weight: null, unit: "lb", reps: 8, done: false, edited: false },
    ]);
  });
});
