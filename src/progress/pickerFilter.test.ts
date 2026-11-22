import type { PickerExercise } from "./progressQueries";
import { filterPicker, showsSearch } from "./pickerFilter";

const make = (n: number): PickerExercise[] =>
  Array.from({ length: n }, (_, i) => ({ exerciseId: i + 1, name: `Exercise ${i + 1}`, equipment: "barbell", lastDoneLabel: null }));

describe("showsSearch", () => {
  it("is off for 8 exercises and on for 9", () => {
    expect(showsSearch(make(8))).toBe(false);
    expect(showsSearch(make(9))).toBe(true);
  });
});

describe("filterPicker", () => {
  const list: PickerExercise[] = [
    { exerciseId: 1, name: "Barbell bench press", equipment: "barbell", lastDoneLabel: "Thu, 12 Nov" },
    { exerciseId: 2, name: "Pull-up", equipment: "bodyweight", lastDoneLabel: null },
    { exerciseId: 3, name: "Weighted pull-up", equipment: "weighted", lastDoneLabel: null },
  ];

  it("returns everything for a blank query", () => {
    expect(filterPicker(list, "  ")).toEqual(list);
  });

  it("matches any part of the name, ignoring case, and keeps the order", () => {
    expect(filterPicker(list, "PULL").map((e) => e.exerciseId)).toEqual([2, 3]);
  });

  it("returns nothing when no name matches", () => {
    expect(filterPicker(list, "squat")).toEqual([]);
  });
});
