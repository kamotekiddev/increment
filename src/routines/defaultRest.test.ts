import { eq } from "drizzle-orm";

import { exercises, routineExercises, routines } from "@/db/schema";
import { readWorkoutSettings, writeDefaultRest } from "@/settings/workoutSetting";

import { createTestDb } from "../../test-support/testDb";
import { newExerciseSetup, stepDefaultRest } from "./routineSetup";
import { restLabel } from "./setupText";

describe("Default rest stepper", () => {
  it("steps 15 s each way", () => {
    expect(stepDefaultRest(90, 1)).toBe(105);
    expect(stepDefaultRest(90, -1)).toBe(75);
  });

  it("stops at 15 s and at 10 min", () => {
    expect(stepDefaultRest(15, -1)).toBe(15);
    expect(stepDefaultRest(600, 1)).toBe(600);
    expect(stepDefaultRest(585, 1)).toBe(600);
  });

  it("reads as m:ss like the exercise sheet", () => {
    expect(restLabel(stepDefaultRest(90, 1))).toBe("1:45");
    expect(restLabel(600)).toBe("10:00");
  });
});

describe("a new Routine exercise", () => {
  it("starts at the Default rest, with the default sets and rep range", () => {
    expect(newExerciseSetup(150)).toEqual({ sets: 3, repMin: 8, repMax: 12, restS: 150 });
  });

  it("starts at 90 s on a fresh database", () => {
    const db = createTestDb();
    expect(newExerciseSetup(readWorkoutSettings(db).defaultRestS).restS).toBe(90);
  });
});

describe("changing the Default rest", () => {
  it("leaves the stored rest of an exercise already in a Routine unchanged", () => {
    const db = createTestDb();
    const routineId = db.insert(routines).values({ name: "Push" }).returning({ id: routines.id }).get().id;
    const exerciseId = db
      .insert(exercises)
      .values({ name: "Bench press", equipment: "barbell", loadType: "weighted" })
      .returning({ id: exercises.id })
      .get().id;
    db.insert(routineExercises)
      .values({ routineId, exerciseId, position: 0, sets: 3, repMin: 8, repMax: 12, restS: 60, rule: { v: 1 } as never })
      .run();

    writeDefaultRest(db, 180);

    expect(readWorkoutSettings(db).defaultRestS).toBe(180);
    expect(db.select({ restS: routineExercises.restS }).from(routineExercises).where(eq(routineExercises.routineId, routineId)).get()?.restS).toBe(60);
  });
});
