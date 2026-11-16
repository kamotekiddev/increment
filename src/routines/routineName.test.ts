import { validateRoutineName } from "./routineName";

const existing = [
  { id: 1, name: "Push" },
  { id: 2, name: "Pull" },
];

describe("validateRoutineName", () => {
  it("accepts a fresh name", () => {
    expect(validateRoutineName("Legs", existing)).toEqual({ ok: true, name: "Legs" });
  });

  it("rejects empty and spaces-only names", () => {
    expect(validateRoutineName("", existing)).toEqual({ ok: false, reason: "empty" });
    expect(validateRoutineName("   ", existing)).toEqual({ ok: false, reason: "empty" });
  });

  it("allows 40 characters and rejects 41", () => {
    expect(validateRoutineName("a".repeat(40), existing).ok).toBe(true);
    expect(validateRoutineName("a".repeat(41), existing)).toEqual({ ok: false, reason: "too-long" });
  });

  it("counts length after trimming", () => {
    expect(validateRoutineName(` ${"a".repeat(40)} `, existing).ok).toBe(true);
  });

  it("rejects a duplicate ignoring capitals and surrounding spaces", () => {
    expect(validateRoutineName("push", existing)).toEqual({ ok: false, reason: "duplicate" });
    expect(validateRoutineName(" Push ", existing)).toEqual({ ok: false, reason: "duplicate" });
  });

  it("returns the trimmed name when ok", () => {
    expect(validateRoutineName("  Legs ", existing)).toEqual({ ok: true, name: "Legs" });
  });

  it("lets a routine be renamed to its own name in different case", () => {
    expect(validateRoutineName("PUSH", existing, 1).ok).toBe(true);
  });

  it("rejects renaming to another routine's name", () => {
    expect(validateRoutineName("pull", existing, 1)).toEqual({ ok: false, reason: "duplicate" });
  });

  it("frees a name once its routine is deleted", () => {
    expect(validateRoutineName("Push", [{ id: 2, name: "Pull" }]).ok).toBe(true);
  });
});
