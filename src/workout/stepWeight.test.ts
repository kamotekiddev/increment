import { JUMP_KG } from "./jump";
import { parseReps, parseWeight, stepWeight } from "./stepWeight";

describe("stepWeight", () => {
  it("moves by the Jump", () => {
    expect(stepWeight(60, 1)).toBe(60 + JUMP_KG);
    expect(stepWeight(60, -1)).toBe(60 - JUMP_KG);
  });
  it("starts a blank weight at the Jump on +, and leaves it blank on −", () => {
    expect(stepWeight(null, 1)).toBe(JUMP_KG);
    expect(stepWeight(null, -1)).toBeNull();
  });
  it("never goes below zero", () => {
    expect(stepWeight(1, -1)).toBe(0);
  });
});

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
