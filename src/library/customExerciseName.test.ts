import { EXERCISE_NAME_MAX, exerciseNameMessage, validateExerciseName } from "./customExerciseName";

const existing = [
  { id: 1, name: "Barbell bench press" },
  { id: 2, name: "Landmine press" },
];

describe("validateExerciseName", () => {
  it("trims the name", () => {
    expect(validateExerciseName("  Ring rows ", existing)).toEqual({ ok: true, name: "Ring rows" });
  });

  it("rejects an empty or blank name", () => {
    expect(validateExerciseName("", existing)).toEqual({ ok: false, reason: "empty" });
    expect(validateExerciseName("   ", existing)).toEqual({ ok: false, reason: "empty" });
  });

  it("allows 40 characters and rejects 41", () => {
    expect(validateExerciseName("a".repeat(EXERCISE_NAME_MAX), existing).ok).toBe(true);
    expect(validateExerciseName("a".repeat(EXERCISE_NAME_MAX + 1), existing)).toEqual({ ok: false, reason: "too-long" });
  });

  it("counts the trimmed length", () => {
    expect(validateExerciseName(` ${"a".repeat(40)} `, existing).ok).toBe(true);
  });

  it("rejects a library or custom name ignoring case and outer spaces", () => {
    expect(validateExerciseName("barbell BENCH press", existing)).toEqual({ ok: false, reason: "duplicate" });
    expect(validateExerciseName("  Landmine press  ", existing)).toEqual({ ok: false, reason: "duplicate" });
  });

  it("collapses runs of whitespace in the saved name and the comparison", () => {
    expect(validateExerciseName("Ring   rows\t x", existing)).toEqual({ ok: true, name: "Ring rows x" });
    expect(validateExerciseName("Landmine   press", existing)).toEqual({ ok: false, reason: "duplicate" });
    expect(validateExerciseName("Landmine press", [{ id: 9, name: "Landmine  Press" }])).toEqual({ ok: false, reason: "duplicate" });
  });

  it("lets an edit keep its own name but not take another's", () => {
    expect(validateExerciseName("landmine press", existing, 2).ok).toBe(true);
    expect(validateExerciseName("Landmine press", existing, 1)).toEqual({ ok: false, reason: "duplicate" });
  });
});

describe("exerciseNameMessage", () => {
  it("names the clashing exercise as typed (trimmed)", () => {
    expect(exerciseNameMessage({ ok: false, reason: "duplicate" }, "  Landmine press ")).toBe(
      "You already have an exercise called Landmine press.",
    );
  });

  it("has no message while empty (Save is just off) and a length message when too long", () => {
    expect(exerciseNameMessage({ ok: false, reason: "empty" }, "")).toBeNull();
    expect(exerciseNameMessage({ ok: false, reason: "too-long" }, "x")).toBe("Keep the name to 40 characters or fewer.");
    expect(exerciseNameMessage({ ok: true, name: "x" }, "x")).toBeNull();
  });
});
