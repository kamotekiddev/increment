import { filterExercises, type ExerciseFilter } from "./filterExercises";

let nextId = 0;
const ex = (name: string, muscles: string[]) => ({ id: nextId++, name, muscles });

const LIST = [
  ex("Squat", ["quadriceps", "glutes"]),
  ex("Dumbbell Bench Press", ["chest", "triceps"]),
  ex("Barbell Bench Press", ["chest", "shoulders", "triceps"]),
  ex("Incline Dumbbell Bench Press", ["chest", "shoulders"]),
  ex("Cable Curl", ["biceps"]),
  ex("Plank", ["abdominals"]),
];

const filter = (set: Partial<ExerciseFilter>): ExerciseFilter => ({ search: "", group: null, ...set });
const names = (r: { name: string }[]) => r.map((e) => e.name);

describe("filterExercises", () => {
  it("matches a word in the name", () => {
    expect(names(filterExercises(LIST, filter({ search: "squat" })))).toEqual(["Squat"]);
  });

  it("matches several words in any order, ignoring capitals", () => {
    expect(names(filterExercises(LIST, filter({ search: "BENCH dumbbell" })))).toEqual([
      "Dumbbell Bench Press",
      "Incline Dumbbell Bench Press",
    ]);
  });

  it("searches names only, not muscles", () => {
    expect(filterExercises(LIST, filter({ search: "chest" }))).toEqual([]);
  });

  it("matches a group when any muscle falls in it", () => {
    expect(names(filterExercises(LIST, filter({ group: "Arms" })))).toEqual([
      "Barbell Bench Press",
      "Cable Curl",
      "Dumbbell Bench Press",
    ]);
    expect(names(filterExercises(LIST, filter({ group: "Legs" })))).toEqual(["Squat"]);
    expect(names(filterExercises(LIST, filter({ group: "Core" })))).toEqual(["Plank"]);
  });

  it("combines search and group", () => {
    expect(names(filterExercises(LIST, filter({ search: "press", group: "Shoulders" })))).toEqual([
      "Barbell Bench Press",
      "Incline Dumbbell Bench Press",
    ]);
  });

  it("returns everything in A-Z order when nothing is set", () => {
    expect(names(filterExercises(LIST, filter({})))).toEqual([
      "Barbell Bench Press",
      "Cable Curl",
      "Dumbbell Bench Press",
      "Incline Dumbbell Bench Press",
      "Plank",
      "Squat",
    ]);
  });

  it("returns an empty list when nothing matches", () => {
    expect(filterExercises(LIST, filter({ search: "zzz" }))).toEqual([]);
  });

  it("ignores extra spaces around and between words", () => {
    expect(names(filterExercises(LIST, filter({ search: "   cable   curl  " })))).toEqual(["Cable Curl"]);
  });

  it("does not change the input list", () => {
    const before = names(LIST);
    filterExercises(LIST, filter({}));
    expect(names(LIST)).toEqual(before);
  });
});
