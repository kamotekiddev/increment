import { classify } from "./outcome";
import type { HistorySession, LoggedSet } from "./types";

const LB = 0.45359237;
const planned = { sets: 3, repMin: 8, repMax: 10 };
const lbJumpKg = 5 * LB;
const sets = (weightKg: number, unit?: LoggedSet["unit"]): LoggedSet[] =>
  [0, 1, 2].map(() => ({ weightKg, reps: 8, done: true, isWarmup: false, unit }));
const session = (over: Partial<HistorySession>): HistorySession => ({
  date: "2026-11-21",
  target: { weightKg: 100, reps: 8 },
  targetUnit: "kg",
  progressAccepted: false,
  isDeload: false,
  sets: sets(100, "kg"),
  ...over,
});

describe("classify: a set logged in another unit than its Target", () => {
  it("meets a 100 kg Target at the 220 lb it was shown as (99.79 kg) in lb", () => {
    expect(classify(session({ sets: sets(220 * LB, "lb") }), planned, { unit: "lb", jumpKg: lbJumpKg })).toBe("clean");
  });

  it("meets a 62.5 kg Target at the 135 lb it was rounded down to (137.79 lb is nearer 140); 130 lb is a Hold", () => {
    const target = { weightKg: 62.5, reps: 8 };
    expect(classify(session({ target, sets: sets(135 * LB, "lb") }), planned, { unit: "lb", jumpKg: lbJumpKg })).toBe("clean");
    expect(classify(session({ target, sets: sets(130 * LB, "lb") }), planned, { unit: "lb", jumpKg: lbJumpKg })).toBe("hold");
  });

  it("is still short of it below the shown weight: 215 lb is a Hold", () => {
    expect(classify(session({ sets: sets(215 * LB, "lb") }), planned, { unit: "lb", jumpKg: lbJumpKg })).toBe("hold");
  });

  it("a set in the Target's own unit is judged against the stored Target, never a snapped one", () => {
    expect(classify(session({ sets: sets(99.79, "kg") }), planned, { unit: "lb", jumpKg: lbJumpKg })).toBe("hold");
    expect(classify(session({ sets: sets(100, "kg") }), planned, { unit: "lb", jumpKg: lbJumpKg })).toBe("clean");
  });

  it("without the current unit, or with no set unit, judges against the stored Target as before", () => {
    expect(classify(session({ sets: sets(220 * LB, "lb") }), planned)).toBe("hold");
    expect(classify(session({ sets: sets(220 * LB) }), planned, { unit: "lb", jumpKg: lbJumpKg })).toBe("hold");
  });
});
