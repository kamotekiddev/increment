import { canMoveExercise } from "./canMoveExercise";

describe("canMoveExercise", () => {
  it("blocks up on the first row", () => {
    expect(canMoveExercise(3, 0, "up")).toBe(false);
  });

  it("blocks down on the last row", () => {
    expect(canMoveExercise(3, 2, "down")).toBe(false);
  });

  it("allows the other directions at the ends", () => {
    expect(canMoveExercise(3, 0, "down")).toBe(true);
    expect(canMoveExercise(3, 2, "up")).toBe(true);
  });

  it("allows both in the middle", () => {
    expect(canMoveExercise(3, 1, "up")).toBe(true);
    expect(canMoveExercise(3, 1, "down")).toBe(true);
  });

  it("blocks both for a single row", () => {
    expect(canMoveExercise(1, 0, "up")).toBe(false);
    expect(canMoveExercise(1, 0, "down")).toBe(false);
  });
});
