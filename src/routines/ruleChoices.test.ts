import { defaultRule, nextTarget, type HistorySession, type OverloadRule } from "../engine";
import { input, session } from "../engine/testing";
import { jumpToSave, ruleChoices, withChoices, type RuleChoices } from "./ruleChoices";

const off: RuleChoices = { type: "weight-first", missDrop: false, deload: false };

/** Three clean workouts in a row at 60 kg × 8 (rep range 8–10), the newest Offer accepted: the next Start steps up. */
const accepted: HistorySession[] = [
  session("2026-11-17", { weightKg: 60, reps: 8 }, [8, 8, 8], { accepted: true }),
  session("2026-11-13", { weightKg: 60, reps: 8 }, [8, 8, 8]),
  session("2026-11-10", { weightKg: 60, reps: 8 }, [8, 8, 8]),
];

const next = (rule: OverloadRule, history: HistorySession[]) => nextTarget(input(history, rule)).target;

describe("withChoices", () => {
  it("maps each rule type to the engine's step and keeps the rule's version, rep step and clean workouts", () => {
    const base = defaultRule("weighted");
    expect(withChoices(base, off)).toEqual({ v: 1, step: "weight", repStep: 1, sessionsToEarn: 3 });
    expect(withChoices(base, { ...off, type: "double" })).toEqual({ v: 1, step: "both", repStep: 1, sessionsToEarn: 3 });
    expect(withChoices(base, { ...off, type: "reps-only" })).toEqual({ v: 1, step: "reps", repStep: 1, sessionsToEarn: 3 });
  });

  it("gives each rule type its own next Target from the same history: 62.5 × 8, 62.5 × 9, 60 × 9", () => {
    const base = defaultRule("weighted");
    expect(next(withChoices(base, off), accepted)).toEqual({ weightKg: 62.5, reps: 8 });
    expect(next(withChoices(base, { ...off, type: "double" }), accepted)).toEqual({ weightKg: 62.5, reps: 9 });
    expect(next(withChoices(base, { ...off, type: "reps-only" }), accepted)).toEqual({ weightKg: 60, reps: 9 });
  });

  it("leaves the miss rule and Deload off when they are off, as the default rule has them", () => {
    const rule = withChoices(defaultRule("weighted"), off);
    expect("miss" in rule).toBe(false);
    expect("deload" in rule).toBe(false);
  });

  it("Drop 10% after two misses in a row: two misses at 60 kg drop the Target to 52.5 kg (54 kg rounded down)", () => {
    const missedTwice = [
      session("2026-11-17", { weightKg: 60, reps: 8 }, [8, 6, 5]),
      session("2026-11-13", { weightKg: 60, reps: 8 }, [8, 7, 5]),
    ];
    const rule = withChoices(defaultRule("weighted"), { ...off, missDrop: true });
    expect(rule.miss).toEqual({ after: 2, action: { kind: "drop", percent: 10 } });
    expect(next(rule, missedTwice)).toEqual({ weightKg: 52.5, reps: 8 });
    // Keep the weight is the rule with no miss rule: the Target stays.
    expect(next(withChoices(defaultRule("weighted"), off), missedTwice)).toEqual({ weightKg: 60, reps: 8 });
  });

  it("Deload every 6 weeks at 60%: due once 6 training weeks have passed, 60 kg becomes 35 kg (36 kg rounded down)", () => {
    const rule = withChoices(defaultRule("weighted"), { ...off, deload: true });
    expect(rule.deload).toEqual({ everyWeeks: 6, percent: 40 });
    // One workout a week, Mondays, newest first.
    const weeks = (n: number) =>
      ["2026-11-16", "2026-11-09", "2026-11-02", "2026-10-26", "2026-10-19", "2026-10-12"]
        .slice(0, n)
        .map((d) => session(d, { weightKg: 60, reps: 8 }, [8, 8, 8]));
    expect(nextTarget(input(weeks(5), rule)).target).toEqual({ weightKg: 60, reps: 8 });
    expect(nextTarget(input(weeks(6), rule))).toMatchObject({ target: { weightKg: 35, reps: 8 }, reason: "deload" });
  });

  it("keeps a saved miss rule or Deload that is still on, rather than resetting it", () => {
    const saved: OverloadRule = {
      ...defaultRule("weighted"),
      miss: { after: 3, action: { kind: "drop", percent: 5 } },
      deload: { everyWeeks: 8, percent: 30 },
    };
    expect(withChoices(saved, { ...off, missDrop: true, deload: true })).toEqual(saved);
  });
});

describe("ruleChoices", () => {
  it("reads the default rule as Weight first with the miss rule and Deload off", () => {
    expect(ruleChoices(defaultRule("weighted"))).toEqual(off);
  });

  it("reads back what withChoices saved", () => {
    const choices: RuleChoices = { type: "double", missDrop: true, deload: true };
    expect(ruleChoices(withChoices(defaultRule("weighted"), choices))).toEqual(choices);
    expect(ruleChoices({ ...defaultRule("weighted"), step: "reps" }).type).toBe("reps-only");
  });

  it("reads a miss rule that keeps the weight as Keep the weight", () => {
    expect(ruleChoices({ ...defaultRule("weighted"), miss: { after: 2, action: { kind: "keep" } } }).missDrop).toBe(false);
  });
});

describe("jumpToSave", () => {
  it("saves the Jump chosen in Add each time as only that unit's column: 2 kg in kg, 10 lb in lb", () => {
    expect(jumpToSave("weighted", "kg", 2)).toEqual({ stepKg: 2 });
    expect(jumpToSave("weighted", "lb", 10)).toEqual({ stepLb: 10 });
  });

  it("saves no Jump for a bodyweight exercise, which shows no Add each time: both stay null until set", () => {
    expect(jumpToSave("bodyweight", "kg", 2.5)).toEqual({});
    expect(jumpToSave("bodyweight", "lb", 5)).toEqual({});
  });
});
