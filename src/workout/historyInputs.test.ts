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
    ]);
    expect(history.map((h) => h.date)).toEqual(["2026-11-08", "2026-11-01"]);
    expect(history[1].sets.map((s) => s.reps)).toEqual([10, 9]);
  });

  it("makes the target null unless both target columns exist", () => {
    expect(toHistory([past({ targetWeightKg: 60, targetReps: null })])[0].target).toBeNull();
    expect(toHistory([past({ targetWeightKg: 60, targetReps: 8 })])[0].target).toEqual({ weightKg: 60, reps: 8 });
  });

  it("feeds the engine: a first workout becomes the baseline Target", () => {
    const history = toHistory([past({ sets: [{ idx: 0, weightKg: 40, reps: 8, done: true, isWarmup: false }] })]);
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
