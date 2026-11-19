import library from "./exercises.json";

const LOAD_TYPES = ["weighted", "bodyweight"];
const EQUIPMENT = ["barbell", "dumbbell", "cable", "machine", "bodyweight", "ez bar", "kettlebell"];

describe("library seed data", () => {
  it("has a library of the intended size", () => {
    expect(library.length).toBeGreaterThanOrEqual(150);
    expect(library.length).toBeLessThanOrEqual(250);
  });

  it("has unique slugs and unique names", () => {
    expect(new Set(library.map((e) => e.slug)).size).toBe(library.length);
    expect(new Set(library.map((e) => e.name.toLowerCase())).size).toBe(library.length);
  });

  it("gives every exercise a valid load type and equipment", () => {
    for (const e of library) {
      expect(LOAD_TYPES).toContain(e.loadType);
      expect(EQUIPMENT).toContain(e.equipment);
    }
  });

  it("gives every exercise muscles and non-empty instructions", () => {
    for (const e of library) {
      expect(e.muscles.length).toBeGreaterThan(0);
      expect(e.instructions.length).toBeGreaterThan(0);
      for (const step of e.instructions) expect(step.trim()).not.toBe("");
    }
  });

  it("uses clean slugs", () => {
    for (const e of library) expect(e.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
  });

  it("matches load type to equipment", () => {
    for (const e of library) {
      if (e.equipment !== "bodyweight" && e.loadType === "bodyweight") {
        throw new Error(`${e.name}: only bodyweight exercises can be reps-only`);
      }
    }
  });

  it("splits each exercise done with or without added weight into a bodyweight one and a weighted twin", () => {
    const pairs = [
      ["pullups", "weighted-pullups"],
      ["chin-up", "weighted-chin-up"],
      ["dips-triceps-version", "weighted-dips-triceps-version"],
      ["bench-dips", "weighted-bench-dips"],
      ["hyperextensions-with-no-hyperextension-bench", "weighted-hyperextensions-with-no-hyperextension-bench"],
      ["glute-ham-raise", "weighted-glute-ham-raise"],
    ];
    const bySlug = new Map(library.map((e) => [e.slug, e]));
    for (const [plain, weighted] of pairs) {
      expect(bySlug.get(plain)).toMatchObject({ loadType: "bodyweight", equipment: "bodyweight" });
      expect(bySlug.get(weighted)).toMatchObject({ loadType: "weighted", equipment: "bodyweight" });
      expect(bySlug.get(weighted)?.name).toBe(`Weighted ${bySlug.get(plain)?.name}`);
    }
  });
});
