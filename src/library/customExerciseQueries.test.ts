import { createTestDb } from "../../test-support/testDb";
import { exercises } from "@/db/schema";

import { exerciseNameRefs, insertCustomExercise } from "./customExerciseQueries";
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
