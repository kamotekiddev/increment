import { eq, sql } from "drizzle-orm";

import { createTestDb } from "../../test-support/testDb";
import { exercises, sets, settings, workoutExercises, workouts } from "./schema";
import { seedLibrary } from "./seed";

/** An install seeded before the split: Pullups and a custom exercise carry the removed load type, and a Pullups workout is logged. */
function installBeforeSplit() {
  const db = createTestDb();
  db.run(sql`INSERT INTO exercises (slug, name, equipment, load_type) VALUES ('pullups', 'Pullups', 'bodyweight', 'bodyweight_or_weighted')`);
  db.run(sql`INSERT INTO exercises (slug, name, equipment, load_type, is_custom) VALUES (NULL, 'Ring rows', 'bodyweight', 'bodyweight_or_weighted', 1)`);
  db.insert(settings).values({ key: "librarySeedVersion", value: 1 }).run();
  const pullups = db.select().from(exercises).where(eq(exercises.slug, "pullups")).get()!;
  const workout = db.insert(workouts).values({ startedAt: 1, date: "2026-11-01", inProgress: false }).returning().get();
  const we = db.insert(workoutExercises).values({ workoutId: workout.id, exerciseId: pullups.id, position: 0 }).returning().get();
  db.insert(sets).values({ workoutExerciseId: we.id, exerciseId: pullups.id, idx: 0, weight: 10, weightUnit: "kg", reps: 6, done: true }).run();
  return { db, pullupsId: pullups.id };
}

describe("seedLibrary", () => {
  it("leaves no exercise with the removed load type and adds each weighted twin", () => {
    const { db } = installBeforeSplit();
    seedLibrary(db);
    const rows = db.select().from(exercises).all();
    expect(rows.filter((e) => (e.loadType as string) === "bodyweight_or_weighted")).toEqual([]);
    for (const slug of ["pullups", "chin-up", "dips-triceps-version", "bench-dips", "hyperextensions-with-no-hyperextension-bench", "glute-ham-raise"]) {
      expect(rows.find((e) => e.slug === slug)).toMatchObject({ loadType: "bodyweight", equipment: "bodyweight" });
      expect(rows.find((e) => e.slug === `weighted-${slug}`)).toMatchObject({ loadType: "weighted", equipment: "bodyweight" });
    }
    expect(rows.find((e) => e.name === "Ring rows")).toMatchObject({ loadType: "bodyweight", isCustom: true });
  });

  it("keeps a logged workout on the original exercise, which becomes the bodyweight one", () => {
    const { db, pullupsId } = installBeforeSplit();
    seedLibrary(db);
    expect(db.select().from(exercises).where(eq(exercises.id, pullupsId)).get()).toMatchObject({ slug: "pullups", loadType: "bodyweight" });
    expect(db.select().from(workoutExercises).all().map((we) => we.exerciseId)).toEqual([pullupsId]);
    expect(db.select().from(sets).all()).toEqual([expect.objectContaining({ exerciseId: pullupsId, weight: 10, reps: 6 })]);
  });

  it("adds no duplicate rows when run again", () => {
    const { db } = installBeforeSplit();
    seedLibrary(db);
    const count = db.select().from(exercises).all().length;
    seedLibrary(db);
    expect(db.select().from(exercises).all()).toHaveLength(count);
  });
});
