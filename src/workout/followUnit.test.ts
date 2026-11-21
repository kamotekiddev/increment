import { stepKgFor } from "../units";
import { followUnit } from "./followUnit";
import type { SetRow } from "./types";

const lbJump = stepKgFor(null, "lb");
const row = (over: Partial<SetRow>): SetRow => ({ weight: 100, unit: "kg", reps: 8, done: false, edited: false, ...over });

describe("followUnit", () => {
  it("an untouched row saved in the other unit shows converted and rounded to the Jump", () => {
    expect(followUnit(row({}), "lb", lbJump)).toEqual(row({ weight: 220, unit: "lb" }));
    expect(followUnit(row({ weight: 135, unit: "lb" }), "kg", stepKgFor(null, "kg"))).toEqual(row({ weight: 60, unit: "kg" }));
  });

  it("rounds down, never to the nearest: 62.5 kg (137.79 lb) shows 135 lb, 24 kg (52.91 lb) shows 50 lb", () => {
    expect(followUnit(row({ weight: 62.5 }), "lb", lbJump)).toEqual(row({ weight: 135, unit: "lb" }));
    expect(followUnit(row({ weight: 24 }), "lb", lbJump)).toEqual(row({ weight: 50, unit: "lb" }));
  });

  it("a done row keeps its saved number and unit", () => {
    const done = row({ done: true });
    expect(followUnit(done, "lb", lbJump)).toBe(done);
  });

  it("a typed row keeps its saved number and unit", () => {
    const typed = row({ weight: 102.5, edited: true });
    expect(followUnit(typed, "lb", lbJump)).toBe(typed);
  });

  it("a row in the current unit is never rounded", () => {
    const own = row({ weight: 61.25 });
    expect(followUnit(own, "kg", stepKgFor(null, "kg"))).toBe(own);
  });

  it("a blank row only takes the new unit", () => {
    expect(followUnit(row({ weight: null }), "lb", lbJump)).toEqual(row({ weight: null, unit: "lb" }));
  });
});
