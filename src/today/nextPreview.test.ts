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
    expect(previewTargetText("weighted", { weightKg: 65, reps: 8 })).toBe("65 kg");
    expect(previewTargetText("weighted", { weightKg: 42.5, reps: 10 })).toBe("42.5 kg");
  });

  it("shows reps for bodyweight", () => {
    expect(previewTargetText("bodyweight", { weightKg: 0, reps: 12 })).toBe("12 reps");
    expect(previewTargetText("bodyweight_or_weighted", { weightKg: 0, reps: 1 })).toBe("1 rep");
    expect(previewTargetText("bodyweight_or_weighted", { weightKg: 10, reps: 8 })).toBe("10 kg");
  });

  it("is empty with no Target yet", () => {
    expect(previewTargetText("weighted", null)).toBe("");
  });
});

describe("toNextPreview", () => {
  it("lists the first three and counts the rest", () => {
    const p = toNextPreview([ex("A"), ex("B"), ex("C"), ex("D")], 5);
    expect(p.rows.map((r) => r.name)).toEqual(["A", "B", "C"]);
    expect(p.more).toBe(2);
  });

  it("has nothing more when three or fewer", () => {
    expect(toNextPreview([ex("A"), ex("B")])).toMatchObject({ more: 0, rows: [{ name: "A" }, { name: "B" }] });
  });

  it("is empty for a Routine with no exercises", () => {
    expect(toNextPreview([])).toEqual({ rows: [], more: 0 });
  });
});
