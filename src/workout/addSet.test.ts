import { addSetRow } from "./addSet";
import type { SetRow } from "./types";

const row = (o: Partial<SetRow> = {}): SetRow => ({ weightKg: 60, reps: 8, done: false, edited: false, ...o });

describe("addSetRow", () => {
  it("appends a copy of the last row, not done and untouched", () => {
    const rows = [row(), row({ weightKg: 62.5, reps: 6, done: true, edited: true })];
    expect(addSetRow(rows)).toEqual([...rows, { weightKg: 62.5, reps: 6, done: false, edited: false }]);
  });
  it("copies a blank weight", () => {
    expect(addSetRow([row({ weightKg: null })])[1].weightKg).toBeNull();
  });
  it("adds a blank row to an empty list", () => {
    expect(addSetRow([])).toEqual([{ weightKg: null, reps: 0, done: false, edited: false }]);
  });
});
