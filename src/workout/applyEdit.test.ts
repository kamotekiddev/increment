import { applyEdit } from "./applyEdit";
import type { SetRow } from "./types";

const fresh = (weightKg: number | null, reps: number): SetRow => ({ weightKg, reps, done: false, edited: false });

describe("applyEdit", () => {
  it("changes the edited row and marks it edited", () => {
    const rows = [fresh(60, 10), fresh(60, 10)];
    const next = applyEdit(rows, 1, { weightKg: 62.5 });
    expect(next[1]).toEqual({ weightKg: 62.5, reps: 10, done: false, edited: true });
  });

  it("makes later untouched rows follow the edit", () => {
    const rows = [fresh(60, 10), fresh(60, 10), fresh(60, 10)];
    const next = applyEdit(rows, 0, { weightKg: 65 });
    expect(next.map((r) => r.weightKg)).toEqual([65, 65, 65]);
    expect(next[1].edited).toBe(false);
    expect(next[2].edited).toBe(false);
  });

  it("an edit on set 2 only affects set 3", () => {
    const rows = [fresh(60, 10), fresh(60, 10), fresh(60, 10)];
    const next = applyEdit(rows, 1, { weightKg: 65 });
    expect(next.map((r) => r.weightKg)).toEqual([60, 65, 65]);
  });

  it("does not change later rows that were edited", () => {
    const rows = [fresh(60, 10), { ...fresh(70, 10), edited: true }, fresh(60, 10)];
    const next = applyEdit(rows, 0, { weightKg: 65 });
    expect(next.map((r) => r.weightKg)).toEqual([65, 70, 65]);
  });

  it("does not change later rows that are done", () => {
    const rows = [fresh(60, 10), { ...fresh(60, 10), done: true }, fresh(60, 10)];
    const next = applyEdit(rows, 0, { weightKg: 65 });
    expect(next.map((r) => r.weightKg)).toEqual([65, 60, 65]);
  });

  it("follows reps as well as weight, and only the field that changed", () => {
    const rows = [fresh(60, 10), fresh(60, 10)];
    const next = applyEdit(rows, 0, { reps: 8 });
    expect(next[1]).toEqual({ weightKg: 60, reps: 8, done: false, edited: false });
  });

  it("fills a blank weight on later rows", () => {
    const rows = [fresh(null, 8), fresh(null, 8)];
    const next = applyEdit(rows, 0, { weightKg: 40 });
    expect(next.map((r) => r.weightKg)).toEqual([40, 40]);
  });

  it("does not mutate the input", () => {
    const rows = [fresh(60, 10), fresh(60, 10)];
    applyEdit(rows, 0, { weightKg: 65 });
    expect(rows[1].weightKg).toBe(60);
  });
});
