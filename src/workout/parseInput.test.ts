import { parseReps, parseWeight } from "./parseInput";

describe("typed values", () => {
  it("parses a weight, accepting a comma", () => {
    expect(parseWeight("62.5")).toBe(62.5);
    expect(parseWeight("62,5")).toBe(62.5);
  });
  it("reads empty text as blank and junk as invalid", () => {
    expect(parseWeight("")).toBeNull();
    expect(parseWeight("abc")).toBeUndefined();
    expect(parseWeight("-5")).toBeUndefined();
  });
  it("parses whole reps only", () => {
    expect(parseReps("8")).toBe(8);
    expect(parseReps("")).toBe(0);
    expect(parseReps("8.5")).toBeUndefined();
    expect(parseReps("-1")).toBeUndefined();
  });
});
