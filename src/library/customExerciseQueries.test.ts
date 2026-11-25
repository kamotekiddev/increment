import { createTestDb } from "../../test-support/testDb";
import { exercises, routineExercises, routines, sets, workoutExercises, workouts } from "@/db/schema";

import {
  exerciseNameRefs,
  insertCustomExercise,
  isExerciseUsed,
  updateCustomExercise,
} from "./customExerciseQueries";
import { newExerciseRow } from "./customExerciseDraft";

describe("custom exercise queries", () => {
  it("inserts a custom row and returns its id; the name then shows up in the name check list", () => {
    const db = createTestDb();
    db.insert(exercises).values({ slug: "bench", name: "Bench press", equipment: "barbell", loadType: "weighted" }).run();
    const id = insertCustomExercise(
      db,
      newExerciseRow({ name: "Ring rows", group: "Back", equipment: "bodyweight", steps: ["Hang", ""] }),
    );
    const row = db.select().from(exercises).all().find((r) => r.id === id)!;
    expect(row).toMatchObject({
      slug: null,
      isCustom: true,
      name: "Ring rows",
      muscles: ["back"],
      loadType: "bodyweight",
      instructions: ["Hang"],
    });
    expect(exerciseNameRefs(db).map((r) => r.name).sort()).toEqual(["Bench press", "Ring rows"]);
  });
});

describe("updateCustomExercise", () => {
  function setup() {
    const db = createTestDb();
    const id = insertCustomExercise(
      db,
      newExerciseRow({ name: "Ring rows", group: "Back", equipment: "bodyweight", steps: ["Hang"] }),
    );
    const bench = db
      .insert(exercises)
      .values({ slug: "bench", name: "Bench press", equipment: "barbell", loadType: "weighted" })
      .returning()
      .get();
    return { db, id, bench };
  }

  it("rewrites name, muscle, equipment, load type and steps, keeping the id", () => {
    const { db, id } = setup();
    updateCustomExercise(
      db,
      id,
      newExerciseRow({ name: "Cable rows", group: "Arms", equipment: "cable", steps: ["Pull", "Hold"] }),
    );
    const row = db.select().from(exercises).all().find((r) => r.id === id)!;
    expect(row).toMatchObject({
      name: "Cable rows",
      muscles: ["arms"],
      equipment: "cable",
      loadType: "weighted",
      instructions: ["Pull", "Hold"],
      isCustom: true,
      slug: null,
    });
  });

  it("never touches a library exercise", () => {
    const { db, bench } = setup();
    updateCustomExercise(
      db,
      bench.id,
      newExerciseRow({ name: "Hacked", group: "Chest", equipment: "other", steps: [] }),
    );
    expect(db.select().from(exercises).all().find((r) => r.id === bench.id)!.name).toBe("Bench press");
  });
});

describe("isExerciseUsed", () => {
  const rule = { v: 1, step: "weight", repStep: 1, sessionsToEarn: 2 } as never;

  it("is false for an exercise in no routine and with no sets", () => {
    const db = createTestDb();
    const id = insertCustomExercise(db, newExerciseRow({ name: "A", group: "Core", equipment: "other", steps: [] }));
    expect(isExerciseUsed(db, id)).toBe(false);
  });

  it("is true once it is in a routine", () => {
    const db = createTestDb();
    const id = insertCustomExercise(db, newExerciseRow({ name: "A", group: "Core", equipment: "other", steps: [] }));
    const routine = db.insert(routines).values({ name: "R", days: 1, position: 0 }).returning().get();
    db.insert(routineExercises)
      .values({ routineId: routine.id, exerciseId: id, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 60, rule })
      .run();
    expect(isExerciseUsed(db, id)).toBe(true);
  });

  it("is true once it has a logged set, even out of every routine", () => {
    const db = createTestDb();
    const id = insertCustomExercise(db, newExerciseRow({ name: "A", group: "Core", equipment: "other", steps: [] }));
    const other = insertCustomExercise(db, newExerciseRow({ name: "B", group: "Core", equipment: "other", steps: [] }));
    const workout = db.insert(workouts).values({ startedAt: 1, date: "2026-11-01", inProgress: false }).returning().get();
    const we = db.insert(workoutExercises).values({ workoutId: workout.id, exerciseId: id, position: 0 }).returning().get();
    db.insert(sets)
      .values({ workoutExerciseId: we.id, exerciseId: id, idx: 0, weight: 10, weightUnit: "kg", reps: 8, done: true })
      .run();
    expect(isExerciseUsed(db, id)).toBe(true);
    expect(isExerciseUsed(db, other)).toBe(false);
  });
});
