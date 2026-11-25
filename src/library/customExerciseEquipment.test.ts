import { EQUIPMENT_CHOICES, loadTypeForEquipment } from "./customExerciseEquipment";

describe("EQUIPMENT_CHOICES", () => {
  it("lists the six chips in design order, stored lowercase", () => {
    expect(EQUIPMENT_CHOICES.map((c) => c.label)).toEqual(["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight", "Other"]);
    expect(EQUIPMENT_CHOICES.map((c) => c.value)).toEqual(["barbell", "dumbbell", "machine", "cable", "bodyweight", "other"]);
  });
});

describe("loadTypeForEquipment", () => {
  it("is bodyweight for Bodyweight and weighted for everything else", () => {
    expect(loadTypeForEquipment("bodyweight")).toBe("bodyweight");
    for (const e of ["barbell", "dumbbell", "machine", "cable", "other"]) {
      expect(loadTypeForEquipment(e)).toBe("weighted");
    }
  });
});
