import { nextTarget } from "../engine";
import { toHistory, type PastExercise } from "./historyInputs";

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
      past({ startedAt: 1, date: "2026-11-01", sets: [{ idx: 1, weightKg: 60, reps: 9, done: true, isWarmup: false }, { idx: 0, weightKg: 60, reps: 10, done: true, isWarmup: false }] }),
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
    const history = toHistory([past({ sets: [{ idx: 0, weightKg: 40, reps: 8, done: true, isWarmup: false }] })], 1);
    const result = nextTarget({
      rule: { v: 1, step: "weight", repStep: 1, sessionsToEarn: 2 },
      planned: { sets: 1, repMin: 8, repMax: 12 },
      loadType: "weighted",
      history,
      jumpKg: 2.5,
    });
    expect(result.target).toEqual({ weightKg: 40, reps: 8 });
  });
});

describe("toHistory by plan position", () => {
  const done = (idx: number) => ({ idx, weightKg: 60, reps: 10, done: true, isWarmup: false });
  const ask = (history: ReturnType<typeof toHistory>) =>
    nextTarget({
      rule: { v: 1, step: "weight", repStep: 1, sessionsToEarn: 1 },
      planned: { sets: 3, repMin: 8, repMax: 10 },
      loadType: "weighted",
      history,
      jumpKg: 2.5,
    });

  it("does not judge sets beyond the planned count", () => {
    const history = toHistory([past({ sets: [done(0), done(1), done(2), done(3)] })], 3);
    expect(history[0].sets).toHaveLength(3);
  });

  it("keeps a gap: plan 3, sets 1 and 2 done, 3 unchecked, extra set 4 done is a Miss, not a Clean", () => {
    // Finish drops the unchecked set 3 but keeps idx, so the extra set stays at idx 3.
    const target = { targetWeightKg: 60, targetReps: 10 };
    const gapHistory = toHistory([past({ ...target, sets: [done(0), done(1), done(3)] })], 3);
    expect(gapHistory[0].sets).toHaveLength(2);
    expect(ask(gapHistory).reason).not.toBe("earned");
    const clean = toHistory([past({ ...target, sets: [done(0), done(1), done(2)] })], 3);
    expect(ask(clean).reason).toBe("earned");
  });
});
