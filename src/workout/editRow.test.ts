import { editRowIndex } from "./editRow";
import type { SetRow } from "./types";

const row = (done: boolean): SetRow => ({ weightKg: 60, reps: 8, done, edited: false });

describe("editRowIndex", () => {
  it("uses the row the lifter touched last", () => {
    expect(editRowIndex([row(true), row(false), row(false)], 0)).toBe(0);
  });
  it("starts on the first set not done", () => {
    expect(editRowIndex([row(true), row(true), row(false)], null)).toBe(2);
  });
  it("falls back to the last set when all are done", () => {
    expect(editRowIndex([row(true), row(true)], null)).toBe(1);
  });
  it("ignores a touched row that no longer exists", () => {
    expect(editRowIndex([row(false)], 5)).toBe(0);
  });
  it("is null with no rows", () => {
    expect(editRowIndex([], null)).toBeNull();
  });
});
