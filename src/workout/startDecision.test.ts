import { startDecision } from "./startDecision";

describe("startDecision", () => {
  it("starts at once when no workout is in progress", () => {
    expect(startDecision(null)).toEqual({ kind: "start" });
  });
  it("asks Resume or Discard when one is in progress, even for the same routine", () => {
    expect(startDecision({ id: 7, routineName: "Push day A" })).toEqual({
      kind: "prompt",
      workoutId: 7,
      routineName: "Push day A",
    });
  });
});
