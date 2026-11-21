import { applyEdit } from "./applyEdit";
import type { SetRow } from "./types";

const fresh = (weight: number | null, reps: number): SetRow => ({ weight, unit: "kg", reps, done: false, edited: false });

describe("applyEdit", () => {
  it("changes the edited row and marks it edited", () => {
    const rows = [fresh(60, 10), fresh(60, 10)];
    const next = applyEdit(rows, 1, { weight: 62.5, unit: "kg" });
    expect(next[1]).toEqual({ weight: 62.5, unit: "kg", reps: 10, done: false, edited: true });
  });

  it("makes later untouched rows follow the edit", () => {
    const rows = [fresh(60, 10), fresh(60, 10), fresh(60, 10)];
    const next = applyEdit(rows, 0, { weight: 65, unit: "kg" });
    expect(next.map((r) => r.weight)).toEqual([65, 65, 65]);
    expect(next[1].edited).toBe(false);
    expect(next[2].edited).toBe(false);
  });

  it("an edit on set 2 only affects set 3", () => {
    const rows = [fresh(60, 10), fresh(60, 10), fresh(60, 10)];
    const next = applyEdit(rows, 1, { weight: 65, unit: "kg" });
    expect(next.map((r) => r.weight)).toEqual([60, 65, 65]);
  });

  it("does not change later rows that were edited", () => {
    const rows = [fresh(60, 10), { ...fresh(70, 10), edited: true }, fresh(60, 10)];
    const next = applyEdit(rows, 0, { weight: 65, unit: "kg" });
    expect(next.map((r) => r.weight)).toEqual([65, 70, 65]);
  });

  it("does not change later rows that are done", () => {
    const rows = [fresh(60, 10), { ...fresh(60, 10), done: true }, fresh(60, 10)];
    const next = applyEdit(rows, 0, { weight: 65, unit: "kg" });
    expect(next.map((r) => r.weight)).toEqual([65, 60, 65]);
  });

  it("follows reps as well as weight, and only the field that changed", () => {
    const rows = [fresh(60, 10), fresh(60, 10)];
    const next = applyEdit(rows, 0, { reps: 8 });
    expect(next[1]).toEqual({ weight: 60, unit: "kg", reps: 8, done: false, edited: false });
  });

  it("fills a blank weight on later rows", () => {
    const rows = [fresh(null, 8), fresh(null, 8)];
    const next = applyEdit(rows, 0, { weight: 40, unit: "kg" });
    expect(next.map((r) => r.weight)).toEqual([40, 40]);
  });

  it("does not mutate the input", () => {
    const rows = [fresh(60, 10), fresh(60, 10)];
    applyEdit(rows, 0, { weight: 65, unit: "kg" });
    expect(rows[1].weight).toBe(60);
  });

  it("saves a typed weight with the unit it was typed in, and later untouched rows take both", () => {
    const rows = [fresh(100, 5), fresh(100, 5)];
    const next = applyEdit(rows, 0, { weight: 225, unit: "lb" });
    expect(next.map((r) => [r.weight, r.unit])).toEqual([
      [225, "lb"],
      [225, "lb"],
    ]);
  });

  it("keeps a row's unit when only reps change", () => {
    const rows = [{ ...fresh(135, 5), unit: "lb" as const }];
    expect(applyEdit(rows, 0, { reps: 6 })[0]).toMatchObject({ weight: 135, unit: "lb", reps: 6 });
  });
});
