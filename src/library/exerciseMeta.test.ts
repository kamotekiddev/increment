import { equipmentIcon, exerciseMeta } from "./exerciseMeta";

describe("exerciseMeta", () => {
  it("joins the first muscle group and the equipment", () => {
    expect(exerciseMeta({ muscles: ["chest", "shoulders", "triceps"], equipment: "barbell" })).toBe("Chest · Barbell");
  });

  it("capitalises each word of the equipment", () => {
    expect(exerciseMeta({ muscles: ["biceps"], equipment: "ez bar" })).toBe("Arms · Ez Bar");
  });

  it("shows only the equipment when no muscle group is known", () => {
    expect(exerciseMeta({ muscles: ["unknown"], equipment: "cable" })).toBe("Cable");
  });
});

describe("equipmentIcon", () => {
  it("uses the flexed arm for bodyweight", () => {
    expect(equipmentIcon("bodyweight")).toBe("arm-flex-outline");
  });

  it("uses the dumbbell for every weighted equipment", () => {
    for (const equipment of ["barbell", "dumbbell", "cable", "machine", "kettlebell", "ez bar"]) {
      expect(equipmentIcon(equipment)).toBe("dumbbell");
    }
  });
});
