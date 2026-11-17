import { defaultRule } from "../engine";
import type { PastExercise } from "./historyInputs";
import { toSummaryInput, type SavedExercise } from "./summaryInput";

const planned = { sets: 3, repMin: 8, repMax: 10 };
const rule = defaultRule("weighted");

const set = (idx: number, reps: number) => ({ idx, weightKg: 60, reps, done: true, isWarmup: false });

const past = (startedAt: number, date: string, reps: number[], extra: Partial<PastExercise> = {}): PastExercise => ({
  startedAt,
  date,
  targetWeightKg: 60,
  targetReps: 10,
  progressAccepted: false,
  isDeload: false,
  sets: reps.map((r, i) => set(i, r)),
  ...extra,
});

const saved = (extra: Partial<SavedExercise> = {}): SavedExercise => ({
  id: 7,
  name: "Bench Press",
  loadType: "weighted",
  plan: { planned, rule },
  sets: [set(0, 10), set(1, 10), set(2, 10)],
  past: [],
  ...extra,
});

describe("toSummaryInput", () => {
  it("puts this workout first in the history, newest first", () => {
    const earlier = past(1_000, "2026-11-10", [10, 9, 8]);
    const now = past(2_000, "2026-11-17", [10, 10, 10]);
    const input = toSummaryInput({ startedAt: 2_000, finishedAt: 3_000, exercises: [saved({ past: [earlier, now] })] }, 2.5);
    const [ex] = input.exercises;
    expect(ex.history.map((h) => h.date)).toEqual(["2026-11-17", "2026-11-10"]);
    expect(ex.jumpKg).toBe(2.5);
    expect(ex.planned).toEqual(planned);
  });

  it("carries this workout's progressAccepted into history[0]", () => {
    const now = past(2_000, "2026-11-17", [10, 10, 10], { progressAccepted: true });
    const [ex] = toSummaryInput({ startedAt: 2_000, finishedAt: 3_000, exercises: [saved({ past: [now] })] }, 2.5).exercises;
    expect(ex.history[0].progressAccepted).toBe(true);
  });

  it("keeps extra sets in sets, in order, but only plan positions in the history", () => {
    const withExtra = [set(3, 10), set(0, 10), set(1, 10), set(2, 10)];
    const now = past(2_000, "2026-11-17", [], { sets: withExtra });
    const [ex] = toSummaryInput({ startedAt: 2_000, finishedAt: 3_000, exercises: [saved({ sets: withExtra, past: [now] })] }, 2.5).exercises;
    expect(ex.sets).toHaveLength(4);
    expect(ex.history[0].sets).toHaveLength(3);
  });

  it("leaves out an exercise that left the routine", () => {
    const input = toSummaryInput({ startedAt: 1, finishedAt: 2, exercises: [saved({ plan: null }), saved({ id: 8 })] }, 2.5);
    expect(input.exercises.map((e) => e.id)).toEqual([8]);
  });

  it("falls back to the start time when there is no finish time", () => {
    expect(toSummaryInput({ startedAt: 5, finishedAt: null, exercises: [] }, 2.5)).toEqual({ startedAt: 5, finishedAt: 5, exercises: [] });
  });
});
