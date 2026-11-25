import { BODYWEIGHT_LOCKED_NOTE, EQUIPMENT_CHOICES, loadTypeForEquipment, lockedEquipment } from "./customExerciseEquipment";

describe("lockedEquipment", () => {
  it("before use, all six chips are open", () => {
    expect(lockedEquipment("barbell", false)).toEqual([]);
    expect(lockedEquipment("bodyweight", false)).toEqual([]);
  });

  it("once used, a weighted exercise can't switch to Bodyweight; the other chips stay open", () => {
    expect(lockedEquipment("barbell", true)).toEqual(["bodyweight"]);
    expect(lockedEquipment("other", true)).toEqual(["bodyweight"]);
  });

  it("once used, a bodyweight exercise can't switch to any weighted chip", () => {
    expect(lockedEquipment("bodyweight", true)).toEqual(["barbell", "dumbbell", "machine", "cable", "other"]);
  });

  it("locks nothing for an unset equipment", () => {
    expect(lockedEquipment(null, true)).toEqual([]);
  });

  it("has the design's note wording", () => {
    expect(BODYWEIGHT_LOCKED_NOTE).toBe("Bodyweight can't be switched once the exercise is used.");
  });
});

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
