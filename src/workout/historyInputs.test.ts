import { nextTarget } from "../engine";
import { loggedUnit, toHistory, type PastExercise } from "./historyInputs";

const past = (over: Partial<PastExercise>): PastExercise => ({
  startedAt: 1,
  date: "2026-11-01",
  targetWeightKg: null,
  targetReps: null,
  progressAccepted: false,
  isDeload: false,
  sets: [],
  ...over,
});

describe("toHistory", () => {
  it("orders sessions newest first and sets by index", () => {
    const history = toHistory([
      past({ startedAt: 1, date: "2026-11-01", sets: [{ idx: 1, weight: 60, weightUnit: "kg" as const, reps: 9, done: true, isWarmup: false }, { idx: 0, weight: 60, weightUnit: "kg" as const, reps: 10, done: true, isWarmup: false }] }),
      past({ startedAt: 2, date: "2026-11-08" }),
    ], 3);
    expect(history.map((h) => h.date)).toEqual(["2026-11-08", "2026-11-01"]);
    expect(history[1].sets.map((s) => s.reps)).toEqual([10, 9]);
  });

  it("makes the target null unless both target columns exist", () => {
    expect(toHistory([past({ targetWeightKg: 60, targetReps: null })], 3)[0].target).toBeNull();
    expect(toHistory([past({ targetWeightKg: 60, targetReps: 8 })], 3)[0].target).toEqual({ weightKg: 60, reps: 8 });
  });

  it("feeds the engine: a first workout becomes the baseline Target", () => {
    const history = toHistory([past({ sets: [{ idx: 0, weight: 40, weightUnit: "kg" as const, reps: 8, done: true, isWarmup: false }] })], 1);
    const result = nextTarget({
      rule: { v: 1, step: "weight", repStep: 1, sessionsToEarn: 2 },
      planned: { sets: 1, repMin: 8, repMax: 12 },
      loadType: "weighted",
      history,
      jumpKg: 2.5,
      unit: "kg",
    });
    expect(result.target).toEqual({ weightKg: 40, reps: 8 });
  });
});

describe("toHistory by plan position", () => {
  const done = (idx: number) => ({ idx, weight: 60, weightUnit: "kg" as const, reps: 10, done: true, isWarmup: false });
  const ask = (history: ReturnType<typeof toHistory>) =>
    nextTarget({
      rule: { v: 1, step: "weight", repStep: 1, sessionsToEarn: 1 },
      planned: { sets: 3, repMin: 8, repMax: 10 },
      loadType: "weighted",
      history,
      jumpKg: 2.5,
      unit: "kg",
    });

  it("keeps a gap: plan 3, sets 1 and 2 done, 3 unchecked is a Miss, not a Clean", () => {
    // Finish drops the unchecked set 3 but keeps idx, so the gap stays.
    const target = { targetWeightKg: 60, targetReps: 10 };
    const gapHistory = toHistory([past({ ...target, sets: [done(0), done(1)] })], 3);
    expect(gapHistory[0].sets).toHaveLength(2);
    expect(ask(gapHistory).reason).not.toBe("earned");
    const clean = toHistory([past({ ...target, sets: [done(0), done(1), done(2)] })], 3);
    expect(ask(clean).reason).toBe("earned");
  });
});

describe("toHistory: the unit a Target was set in", () => {
  const set = (weight: number, weightUnit: "kg" | "lb") => ({ idx: 0, weight, weightUnit, reps: 8, done: true, isWarmup: false });
  const target = { targetWeightKg: 10, targetReps: 8 };
  const unitOf = (row: Partial<PastExercise>) => toHistory([past(row)], 3)[0].targetUnit;

  it("uses the unit stored at Start", () => {
    expect(unitOf({ ...target, targetUnit: "lb", sets: [set(10, "kg")] })).toBe("lb");
  });
  it("falls back to the logged sets' unit on an old row with none stored", () => {
    expect(unitOf({ ...target, targetUnit: null, sets: [set(10, "lb")] })).toBe("lb");
  });
  it("falls back to kg when nothing says otherwise", () => {
    expect(unitOf({ ...target, targetUnit: null, sets: [] })).toBe("kg");
  });
  it("an accepted Target uses the unit of the Go up tap, or the Target's unit on an older row", () => {
    const accepted = { ...target, acceptedTargetWeightKg: 12, acceptedTargetReps: 8, targetUnit: "kg" as const };
    expect(toHistory([past({ ...accepted, acceptedTargetUnit: "lb" })], 3)[0].acceptedTargetUnit).toBe("lb");
    expect(toHistory([past({ ...accepted, acceptedTargetUnit: null })], 3)[0].acceptedTargetUnit).toBe("kg");
  });
  it("a first workout with no Target uses the unit its heaviest set was logged in", () => {
    // 30 lb (13.61 kg) is heavier than 10 kg.
    const sets = [set(10, "kg"), { ...set(30, "lb"), idx: 1 }];
    expect(unitOf({ targetUnit: "kg", sets })).toBe("lb");
  });
});

describe("toHistory: weights are kg in memory only", () => {
  it("gives the engine kg for a set saved as 135 lb, and leaves the saved set as typed", () => {
    const sets = [{ idx: 0, weight: 135, weightUnit: "lb" as const, reps: 5, done: true, isWarmup: false }];
    const [session] = toHistory([past({ sets })], 1);
    expect(session.sets[0].weightKg).toBeCloseTo(61.23497, 5);
    expect(sets[0]).toEqual({ idx: 0, weight: 135, weightUnit: "lb", reps: 5, done: true, isWarmup: false });
  });

  it("compares mixed units in kg: 225 lb (102.06 kg) is heavier than 100 kg", () => {
    const sets = [
      { idx: 0, weight: 100, weightUnit: "kg" as const, reps: 5, done: true, isWarmup: false },
      { idx: 1, weight: 225, weightUnit: "lb" as const, reps: 5, done: true, isWarmup: false },
    ];
    expect(loggedUnit(sets)).toBe("lb");
    const kg = toHistory([past({ sets })], 2)[0].sets.map((s) => s.weightKg);
    expect(Math.max(...kg)).toBeCloseTo(102.058, 3);
  });
});
