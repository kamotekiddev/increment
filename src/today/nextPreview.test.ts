import { previewTargetText, toNextPreview, type PreviewExercise } from "./nextPreview";

const ex = (name: string, over: Partial<PreviewExercise> = {}): PreviewExercise => ({
  name,
  equipment: "barbell",
  loadType: "weighted",
  target: { weightKg: 65, reps: 8 },
  ...over,
});

describe("previewTargetText", () => {
  it("shows weight and unit only", () => {
    expect(previewTargetText("weighted", { weightKg: 65, reps: 8 }, "kg")).toBe("65 kg");
    expect(previewTargetText("weighted", { weightKg: 42.5, reps: 10 }, "kg")).toBe("42.5 kg");
  });

  it("shows reps for bodyweight", () => {
    expect(previewTargetText("bodyweight", { weightKg: 0, reps: 12 }, "kg")).toBe("12 reps");
    expect(previewTargetText("bodyweight", { weightKg: 0, reps: 1 }, "kg")).toBe("1 rep");
  });

  it("shows the added weight for a weighted bodyweight exercise", () => {
    expect(previewTargetText("weighted", { weightKg: 10, reps: 8 }, "kg")).toBe("10 kg");
  });

  it("converts to lb", () => {
    expect(previewTargetText("weighted", { weightKg: 65, reps: 8 }, "lb")).toBe("143.3 lb");
    expect(previewTargetText("bodyweight", { weightKg: 0, reps: 12 }, "lb")).toBe("12 reps");
  });

  it("is empty with no Target yet", () => {
    expect(previewTargetText("weighted", null, "kg")).toBe("");
  });
});

describe("toNextPreview", () => {
  it("lists the first three and counts the rest", () => {
    const p = toNextPreview([ex("A"), ex("B"), ex("C"), ex("D")], "kg", 5);
    expect(p.rows.map((r) => r.name)).toEqual(["A", "B", "C"]);
    expect(p.more).toBe(2);
  });

  it("has nothing more when three or fewer", () => {
    expect(toNextPreview([ex("A"), ex("B")], "kg")).toMatchObject({ more: 0, rows: [{ name: "A" }, { name: "B" }] });
  });

  it("is empty for a Routine with no exercises", () => {
    expect(toNextPreview([], "kg")).toEqual({ rows: [], more: 0 });
  });
});
