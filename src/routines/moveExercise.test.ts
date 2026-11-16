import { moveExercise } from "./moveExercise";

describe("moveExercise", () => {
  const list = ["a", "b", "c"];

  it("moves an item up", () => {
    expect(moveExercise(list, 1, "up")).toEqual(["b", "a", "c"]);
  });

  it("moves an item down", () => {
    expect(moveExercise(list, 1, "down")).toEqual(["a", "c", "b"]);
  });

  it("leaves the first item in place when moved up", () => {
    expect(moveExercise(list, 0, "up")).toEqual(["a", "b", "c"]);
  });

  it("leaves the last item in place when moved down", () => {
    expect(moveExercise(list, 2, "down")).toEqual(["a", "b", "c"]);
  });

  it("does not change the input", () => {
    moveExercise(list, 1, "up");
    expect(list).toEqual(["a", "b", "c"]);
  });

  it("ignores an index outside the list", () => {
    expect(moveExercise(list, 5, "up")).toEqual(["a", "b", "c"]);
  });
});
