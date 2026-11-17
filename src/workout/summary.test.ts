import { defaultRule, type HistorySession, type LoggedSet, type OverloadRule } from "../engine";
import { planned, session } from "../engine/testing";
import { buildSummary, type SummaryExercise } from "./summary";

const MIN = 60_000;
const t60 = { weightKg: 60, reps: 10 };

const sets = (reps: number[], weightKg = 60): LoggedSet[] => reps.map((r) => ({ weightKg, reps: r, done: true, isWarmup: false }));

/** `history` is newest first with this workout at [0]. */
function exercise(history: HistorySession[], rule: Partial<OverloadRule> = {}, extra: Partial<SummaryExercise> = {}): SummaryExercise {
  return {
    id: 1,
    name: "Bench Press",
    sets: history[0]?.sets ?? [],
    planned,
    rule: { ...defaultRule("weighted"), ...rule },
    loadType: "weighted",
    jumpKg: 2.5,
    history,
    ...extra,
  };
}

const build = (exercises: SummaryExercise[], minutes = 45) =>
  buildSummary({ startedAt: 1_000_000, finishedAt: 1_000_000 + minutes * MIN + 20_000, exercises });

const only = (ex: SummaryExercise) => build([ex]).cards[0];

const clean3 = (date: string, opts = {}) => session(date, t60, [10, 10, 10], opts);

describe("buildSummary header", () => {
  it("counts whole minutes, done working sets and volume in kg", () => {
    const ex = exercise([session("2026-11-17", t60, [10, 10, 8])]);
    expect(build([ex], 45).header).toEqual({ durationMinutes: 45, sets: 3, volumeKg: 60 * 28, totalReps: 28, showTotalReps: false });
  });

  it("ignores sets that are not done and warmups", () => {
    const ex = exercise([clean3("2026-11-17")], {}, {
      sets: [
        ...sets([10, 10]),
        { weightKg: 60, reps: 10, done: false, isWarmup: false },
        { weightKg: 20, reps: 10, done: true, isWarmup: true },
      ],
    });
    expect(build([ex]).header).toMatchObject({ sets: 2, volumeKg: 1200 });
  });

  it("counts a weighted bodyweight set at its added load and a bodyweight set as 0", () => {
    const weighted = exercise([session("2026-11-17", null, [8], { weightKg: 10 })], {}, { loadType: "bodyweight_or_weighted", sets: sets([8], 10) });
    const bare = exercise([session("2026-11-17", null, [12], { weightKg: 0 })], {}, { id: 2, name: "Pull-up", loadType: "bodyweight", sets: sets([12], 0) });
    expect(build([weighted, bare]).header).toMatchObject({ sets: 2, volumeKg: 80, showTotalReps: false });
  });

  it("shows total reps when only bodyweight sets were done", () => {
    const bare = exercise([session("2026-11-17", null, [12, 10], { weightKg: 0 })], {}, { loadType: "bodyweight", sets: sets([12, 10], 0) });
    expect(build([bare]).header).toMatchObject({ volumeKg: 0, totalReps: 22, showTotalReps: true });
  });

  it("leaves a skipped exercise out of the cards and the counts", () => {
    const done = exercise([clean3("2026-11-17")]);
    const skipped = exercise([session("2026-11-17", t60, [])], {}, { id: 2, name: "Row", sets: [] });
    const out = build([done, skipped]);
    expect(out.cards.map((c) => c.name)).toEqual(["Bench Press"]);
    expect(out.header.sets).toBe(3);
  });
});

describe("buildSummary cards", () => {
  it("Clean 1 of 3 shows Streak progress and the next Target", () => {
    const card = only(exercise([clean3("2026-11-17")]));
    expect(card).toMatchObject({ outcome: "clean", streak: 1, next: t60, offer: null, line: "2 more at 60 kg × 10 to earn 62.5 kg × 10." });
  });

  it("counts earlier Clean workouts at the same Target", () => {
    const card = only(exercise([clean3("2026-11-17"), clean3("2026-11-14")]));
    expect(card.streak).toBe(2);
    expect(card.line).toBe("1 more at 60 kg × 10 to earn 62.5 kg × 10.");
  });

  it("Earned carries an Offer and keeps the current Target until accepted", () => {
    const card = only(exercise([clean3("2026-11-17"), clean3("2026-11-14"), clean3("2026-11-11")]));
    expect(card.offer).toEqual({ target: { weightKg: 62.5, reps: 10 }, accepted: false });
    expect(card.next).toEqual(t60);
    expect(card.line).toBe("Earned. Move up to 62.5 kg × 10?");
  });

  it("Accepted shows the stepped Target and keeps the Offer so it can be flipped back", () => {
    const card = only(exercise([clean3("2026-11-17", { accepted: true }), clean3("2026-11-14"), clean3("2026-11-11")]));
    expect(card.offer).toEqual({ target: { weightKg: 62.5, reps: 10 }, accepted: true });
    expect(card.next).toEqual({ weightKg: 62.5, reps: 10 });
    expect(card.line).toBe("Earned. Moving up to 62.5 kg × 10.");
  });

  it("Hold keeps the Target, restarts the Streak and has no Offer", () => {
    const card = only(exercise([session("2026-11-17", t60, [10, 9, 9])]));
    expect(card).toMatchObject({ outcome: "hold", streak: null, next: t60, offer: null });
    expect(card.line).toBe("Held: short of the Target but inside the rep range. Streak restarts, Target stays.");
  });

  it("Miss without a rule keeps the Target", () => {
    const card = only(exercise([session("2026-11-17", t60, [10, 7, 7])]));
    expect(card).toMatchObject({ outcome: "miss", next: t60 });
    expect(card.line).toBe("Missed: below the rep range or short on sets. Streak restarts, Target stays.");
  });

  it("Miss with a keep rule says so", () => {
    const card = only(exercise([session("2026-11-17", t60, [7, 7, 7])], { miss: { after: 1, action: { kind: "keep" } } }));
    expect(card.line).toBe("Missed again. Your rule keeps the Target.");
    expect(card.next).toEqual(t60);
  });

  it("Miss with a drop shows the dropped Target", () => {
    const card = only(exercise([session("2026-11-17", t60, [7, 7, 7])], { miss: { after: 1, action: { kind: "drop", percent: 10 } } }));
    expect(card.next).toEqual({ weightKg: 52.5, reps: 10 });
    expect(card.line).toBe("Missed again. Your rule drops the Target to 52.5 kg × 10.");
  });

  it("first workout sets a baseline from what was logged", () => {
    const card = only(exercise([session("2026-11-17", null, [10, 9, 9], { weightKg: 40 })]));
    expect(card).toMatchObject({ outcome: "baseline", streak: null, next: { weightKg: 40, reps: 9 }, offer: null });
    expect(card.line).toBe("First time: baseline set from what you logged.");
  });

  it("top of range with no step has no Offer and says why", () => {
    const top = { weightKg: 60, reps: 10 };
    const history = [session("2026-11-17", top, [10, 10, 10]), session("2026-11-14", top, [10, 10, 10]), session("2026-11-11", top, [10, 10, 10])];
    const card = only(exercise(history, { step: "reps" }));
    expect(card.offer).toBeNull();
    expect(card.next).toEqual(top);
    expect(card.line).toBe("Earned, but you are at the top of your rep range, so there is no step up. Target stays.");
  });

  it("a Deload workout does not count toward the Streak and gets no Offer", () => {
    const history = [
      session("2026-11-17", { weightKg: 50, reps: 10 }, [10, 10, 10], { deload: true }),
      clean3("2026-11-14"),
      clean3("2026-11-11"),
      clean3("2026-11-08"),
    ];
    const card = only(exercise(history));
    expect(card).toMatchObject({ outcome: "deload", streak: null, offer: null, next: t60 });
    expect(card.line).toBe("Deload workout. It does not count toward your Streak.");
  });

  it("announces a Deload coming next", () => {
    const card = only(exercise([clean3("2026-11-17"), clean3("2026-11-10")], { deload: { everyWeeks: 2, percent: 20 } }));
    expect(card.next).toEqual({ weightKg: 47.5, reps: 10 });
    expect(card.line).toBe("Next workout is a Deload at a lighter weight. It does not count toward your Streak.");
  });

  it("keeps cards in workout order", () => {
    const a = exercise([clean3("2026-11-17")], {}, { id: 1, name: "Bench Press" });
    const b = exercise([clean3("2026-11-17")], {}, { id: 2, name: "Row" });
    expect(build([b, a]).cards.map((c) => c.name)).toEqual(["Row", "Bench Press"]);
  });
});
