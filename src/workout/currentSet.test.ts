import { currentSetIndex } from "./currentSet";

const rows = (...done: boolean[]) => done.map((d) => ({ done: d }));

describe("currentSetIndex", () => {
  it("is the first set on an untouched exercise", () => {
    expect(currentSetIndex(rows(false, false, false))).toBe(0);
  });
  it("is the first set that is not done", () => {
    expect(currentSetIndex(rows(true, true, false))).toBe(2);
  });
  it("stays on the first open set when a later set was done first", () => {
    expect(currentSetIndex(rows(true, false, false, true))).toBe(1);
  });
  it("is null when every set is done", () => {
    expect(currentSetIndex(rows(true, true))).toBeNull();
  });
});
