import { classify } from "./outcome";
import { nextTarget, weekIndex } from "./nextTarget";
import { defaultRule } from "./rule";
import { input, planned, session } from "./testing";

const T = { weightKg: 60, reps: 8 };

describe("classify", () => {
  it("clean: every set at or above the Target", () => {
    expect(classify(session("2026-01-05", T, [8, 8, 8]), planned)).toBe("clean");
    expect(classify(session("2026-01-05", T, [9, 10, 8]), planned)).toBe("clean");
  });
  it("hold: short of the Target but inside the range", () => {
    expect(classify(session("2026-01-05", { weightKg: 60, reps: 9 }, [9, 9, 8]), planned)).toBe("hold");
  });
  it("miss: a set below repMin", () => {
    expect(classify(session("2026-01-05", T, [8, 8, 7]), planned)).toBe("miss");
  });
  it("miss: fewer working sets than planned", () => {
    expect(classify(session("2026-01-05", T, [8, 8]), planned)).toBe("miss");
  });
  it("lifting heavier than the Target is clean", () => {
    expect(classify(session("2026-01-05", T, [8, 8, 8], { weightKg: 62.5 }), planned)).toBe("clean");
  });
  it("lifting lighter than the Target is a hold when reps are in range", () => {
    expect(classify(session("2026-01-05", T, [10, 10, 10], { weightKg: 57.5 }), planned)).toBe("hold");
  });
  it("only the first planned sets are judged; extra sets are ignored", () => {
    expect(classify(session("2026-01-05", T, [8, 8, 8, 3]), planned)).toBe("clean");
    expect(classify(session("2026-01-05", T, [8, 8, 7, 9]), planned)).toBe("miss");
  });
  it("ignores warm-up and not-done sets", () => {
    const s = session("2026-01-05", T, [8, 8, 8]);
    s.sets.unshift({ weightKg: 20, reps: 1, done: true, isWarmup: true });
    s.sets.push({ weightKg: 60, reps: 0, done: false, isWarmup: false });
    expect(classify(s, planned)).toBe("clean");
  });
  it("no Target is a baseline, a deload is a deload", () => {
    expect(classify(session("2026-01-05", null, [8, 8, 8]), planned)).toBe("baseline");
    expect(classify(session("2026-01-05", T, [8, 8, 8], { deload: true }), planned)).toBe("deload");
  });
});

describe("nextTarget: first workouts", () => {
  it("has no Target without history", () => {
    expect(nextTarget(input([]))).toEqual({ target: null, proposal: null, reason: "no-history" });
  });
  it("first workout sets the baseline from the lifter's own weight and does not count toward the streak", () => {
    const r = nextTarget(input([session("2026-01-05", null, [9, 8, 8], { weightKg: 60 })]));
    expect(r).toEqual({ target: { weightKg: 60, reps: 8 }, proposal: null, reason: "baseline" });
  });
  it("baseline reps are clamped into the range", () => {
    const r = nextTarget(input([session("2026-01-05", null, [5, 5, 5], { weightKg: 60 })]));
    expect(r.target).toEqual({ weightKg: 60, reps: 8 });
  });
  it("a baseline workout followed by one clean workout is a streak of 1", () => {
    const r = nextTarget(input([session("2026-01-12", T, [8, 8, 8]), session("2026-01-05", null, [8, 8, 8])]));
    expect(r.reason).toBe("on-track");
  });
});

describe("nextTarget: earning progression (free rule, 3 clean in a row)", () => {
  const clean = (d: string) => session(d, T, [8, 8, 8]);

  it("two clean workouts is not earned", () => {
    const r = nextTarget(input([clean("2026-01-19"), clean("2026-01-12")]));
    expect(r).toEqual({ target: T, proposal: null, reason: "on-track" });
  });
  it("three clean workouts earns it and offers the step, but keeps the Target", () => {
    const r = nextTarget(input([clean("2026-01-26"), clean("2026-01-19"), clean("2026-01-12")]));
    expect(r).toEqual({ target: T, proposal: { weightKg: 62.5, reps: 8 }, reason: "earned" });
  });
  it("accepting the offer applies from the following workout", () => {
    const accepted = session("2026-01-26", T, [8, 8, 8], { accepted: true });
    const r = nextTarget(input([accepted, clean("2026-01-19"), clean("2026-01-12")]));
    expect(r).toEqual({ target: { weightKg: 62.5, reps: 8 }, proposal: null, reason: "progressed" });
  });
  it("declining keeps the Target and asks again after the next clean workout", () => {
    const r = nextTarget(
      input([clean("2026-02-02"), clean("2026-01-26"), clean("2026-01-19"), clean("2026-01-12")]),
    );
    expect(r.reason).toBe("earned");
    expect(r.proposal).toEqual({ weightKg: 62.5, reps: 8 });
  });
  it("a hold breaks the streak", () => {
    const hold = session("2026-01-19", { weightKg: 60, reps: 9 }, [9, 9, 8]);
    const r = nextTarget(input([clean("2026-01-26"), hold, clean("2026-01-12")]));
    expect(r.reason).toBe("on-track");
    expect(r.proposal).toBeNull();
  });
  it("a changed Target restarts the streak", () => {
    const old = session("2026-01-19", { weightKg: 57.5, reps: 8 }, [8, 8, 8]);
    const r = nextTarget(input([clean("2026-01-26"), old, old]));
    expect(r.reason).toBe("on-track");
  });
  it("sessionsToEarn is configurable", () => {
    const one = nextTarget(input([clean("2026-01-12")], { sessionsToEarn: 1 }));
    expect(one.reason).toBe("earned");
    const five = nextTarget(input([clean("2026-02-02"), clean("2026-01-26"), clean("2026-01-19"), clean("2026-01-12")], { sessionsToEarn: 5 }));
    expect(five.reason).toBe("on-track");
  });
  it("the hold outcome keeps the Target", () => {
    const hold = session("2026-01-12", { weightKg: 60, reps: 9 }, [9, 9, 8]);
    expect(nextTarget(input([hold]))).toEqual({ target: { weightKg: 60, reps: 9 }, proposal: null, reason: "hold" });
  });
});

describe("nextTarget: steps", () => {
  const earned = (target: { weightKg: number; reps: number }, accepted = false) => [
    session("2026-01-26", target, [target.reps, target.reps, target.reps], { accepted }),
    session("2026-01-19", target, [target.reps, target.reps, target.reps]),
    session("2026-01-12", target, [target.reps, target.reps, target.reps]),
  ];

  it("weight: adds the jump and keeps the reps", () => {
    expect(nextTarget(input(earned(T), { step: "weight" })).proposal).toEqual({ weightKg: 62.5, reps: 8 });
  });
  it("reps: adds the rep step and keeps the weight", () => {
    expect(nextTarget(input(earned(T), { step: "reps" })).proposal).toEqual({ weightKg: 60, reps: 9 });
    expect(nextTarget(input(earned(T), { step: "reps", repStep: 2 })).proposal).toEqual({ weightKg: 60, reps: 10 });
  });
  it("reps: caps at the top of the range", () => {
    expect(nextTarget(input(earned(T), { step: "reps", repStep: 3 })).proposal).toEqual({ weightKg: 60, reps: 10 });
  });
  it("reps: at the top of the range there is nothing to offer", () => {
    const r = nextTarget(input(earned({ weightKg: 60, reps: 10 }), { step: "reps" }));
    expect(r).toEqual({ target: { weightKg: 60, reps: 10 }, proposal: null, reason: "at-top-of-range" });
  });
  it("both: adds the jump and the rep step together", () => {
    expect(nextTarget(input(earned(T), { step: "both" })).proposal).toEqual({ weightKg: 62.5, reps: 9 });
  });
  it("both: reps cap at the top of the range but weight still rises", () => {
    const r = nextTarget(input(earned({ weightKg: 60, reps: 10 }), { step: "both" }));
    expect(r.proposal).toEqual({ weightKg: 62.5, reps: 10 });
  });
  it("accepting a reps step applies it next workout", () => {
    const r = nextTarget(input(earned(T, true), { step: "reps" }));
    expect(r).toEqual({ target: { weightKg: 60, reps: 9 }, proposal: null, reason: "progressed" });
  });
  it("bodyweight exercises can only step by reps, whatever the rule says", () => {
    const bw = { weightKg: 0, reps: 8 };
    const r = nextTarget(input(earned(bw), { step: "weight" }, { loadType: "bodyweight" }));
    expect(r.proposal).toEqual({ weightKg: 0, reps: 9 });
    expect(nextTarget(input(earned(bw), { step: "both" }, { loadType: "bodyweight" })).proposal).toEqual({ weightKg: 0, reps: 9 });
  });
  it("an off-grid weight steps to the next multiple, never back to itself", () => {
    const r = nextTarget(input(earned({ weightKg: 61, reps: 8 }), { step: "weight" }));
    expect(r.proposal).toEqual({ weightKg: 62.5, reps: 8 });
  });
  it("lb-derived jumps do not land one multiple off", () => {
    const jumpKg = 5 * 0.45359237;
    const w = 135 * 0.45359237;
    const r = nextTarget(input(earned({ weightKg: w, reps: 8 }), { step: "weight" }, { jumpKg }));
    expect(r.proposal!.weightKg).toBeCloseTo(w + jumpKg, 6);
  });
});

describe("nextTarget: misses", () => {
  const miss = (d: string, weightKg = 60) => session(d, { weightKg, reps: 8 }, [8, 8, 6]);
  const keep = { miss: { after: 2, action: { kind: "keep" } as const } };
  const drop = { miss: { after: 2, action: { kind: "drop", percent: 10 } as const } };

  it("a single miss keeps the Target", () => {
    expect(nextTarget(input([miss("2026-01-19")], drop))).toMatchObject({ target: T, reason: "miss" });
  });
  it("without a miss rule, misses never change the Target", () => {
    expect(nextTarget(input([miss("2026-01-26"), miss("2026-01-19"), miss("2026-01-12")])).target).toEqual(T);
  });
  it("two misses in a row with 'keep' keeps the weight", () => {
    expect(nextTarget(input([miss("2026-01-26"), miss("2026-01-19")], keep))).toMatchObject({ target: T, reason: "miss-keep" });
  });
  it("two misses in a row with 'drop 10%' drops to a lower multiple of the jump", () => {
    const r = nextTarget(input([miss("2026-01-26"), miss("2026-01-19")], drop));
    expect(r).toEqual({ target: { weightKg: 52.5, reps: 8 }, proposal: null, reason: "miss-drop" });
  });
  it("the miss count restarts at the new weight after a drop", () => {
    const r = nextTarget(input([miss("2026-02-02", 52.5), miss("2026-01-26"), miss("2026-01-19")], drop));
    expect(r.reason).toBe("miss");
    expect(r.target).toEqual({ weightKg: 52.5, reps: 8 });
  });
  it("a hold between misses neither counts nor resets", () => {
    const hold = session("2026-01-19", T, [8, 8, 8], { weightKg: 57.5 }); // lighter than the Target, reps in range
    expect(classify(hold, planned)).toBe("hold");
    const r = nextTarget(input([miss("2026-01-26"), hold, miss("2026-01-12")], keep));
    expect(r.reason).toBe("miss-keep");
  });
  it("a clean workout resets the miss count", () => {
    const clean = session("2026-01-19", T, [8, 8, 8]);
    const r = nextTarget(input([miss("2026-01-26"), clean, miss("2026-01-12")], keep));
    expect(r.reason).toBe("miss");
  });
  it("a miss drop always goes strictly lower", () => {
    const tiny = { miss: { after: 1, action: { kind: "drop", percent: 1 } as const } };
    const r = nextTarget(input([miss("2026-01-19")], tiny));
    expect(r.target!.weightKg).toBe(57.5);
  });
  it("a miss drop never goes below zero", () => {
    const r = nextTarget(input([miss("2026-01-19", 0)], { miss: { after: 1, action: { kind: "drop", percent: 10 } } }));
    expect(r.target!.weightKg).toBe(0);
  });
});

describe("nextTarget: deload", () => {
  const wk = (d: string) => session(d, T, [8, 8, 8]);
  const rule = { deload: { everyWeeks: 4, percent: 10 } };

  it("is off unless the lifter turns it on", () => {
    const h = [wk("2026-02-02"), wk("2026-01-26"), wk("2026-01-19"), wk("2026-01-12")];
    expect(nextTarget(input(h)).reason).not.toBe("deload");
  });
  it("is not due before N training weeks", () => {
    const h = [wk("2026-01-26"), wk("2026-01-19"), wk("2026-01-12")];
    expect(nextTarget(input(h, rule)).reason).not.toBe("deload");
  });
  it("lightens the next Target after N training weeks, rounded down to the jump", () => {
    const h = [wk("2026-02-02"), wk("2026-01-26"), wk("2026-01-19"), wk("2026-01-12")];
    const r = nextTarget(input(h, rule));
    expect(r).toEqual({ target: { weightKg: 52.5, reps: 8 }, proposal: null, reason: "deload" });
  });
  it("counts weeks with a workout, not workouts", () => {
    const h = [wk("2026-01-15"), wk("2026-01-14"), wk("2026-01-13"), wk("2026-01-12")]; // all in one week
    expect(nextTarget(input(h, rule)).reason).not.toBe("deload");
  });
  it("goes back to the working Target after the deload workout", () => {
    const dl = session("2026-02-09", { weightKg: 52.5, reps: 8 }, [8, 8, 8], { deload: true });
    const h = [dl, wk("2026-02-02"), wk("2026-01-26"), wk("2026-01-19"), wk("2026-01-12")];
    const r = nextTarget(input(h, rule));
    expect(r.target).toEqual(T);
    expect(r.reason).not.toBe("deload");
  });
  it("a deload workout neither counts toward nor resets the streak", () => {
    const dl = session("2026-01-26", { weightKg: 54, reps: 8 }, [8, 8, 8], { deload: true });
    const h = [wk("2026-02-02"), dl, wk("2026-01-19"), wk("2026-01-12")];
    expect(nextTarget(input(h)).reason).toBe("earned");
  });
  it("a deload workout is never a miss", () => {
    const dl = session("2026-01-26", { weightKg: 54, reps: 8 }, [2, 2, 2], { deload: true });
    const m = (d: string) => session(d, T, [8, 8, 6]);
    const r = nextTarget(input([dl, m("2026-01-19"), m("2026-01-12")], { miss: { after: 2, action: { kind: "keep" } } }));
    expect(r.reason).toBe("miss-keep");
  });
  it("a pending offer survives a deload", () => {
    const dl = session("2026-02-09", { weightKg: 52.5, reps: 8 }, [8, 8, 8], { deload: true });
    const h = [dl, wk("2026-02-02"), wk("2026-01-26"), wk("2026-01-19")];
    expect(nextTarget(input(h)).reason).toBe("earned");
  });
});

describe("weekIndex", () => {
  it("groups Monday to Sunday", () => {
    expect(weekIndex("2026-01-12")).toBe(weekIndex("2026-01-18"));
    expect(weekIndex("2026-01-18")).not.toBe(weekIndex("2026-01-19"));
  });
  it("handles year boundaries", () => {
    expect(weekIndex("2025-12-29")).toBe(weekIndex("2026-01-04"));
  });
});

describe("defaultRule", () => {
  it("picks the step from the load type", () => {
    expect(defaultRule("weighted").step).toBe("weight");
    expect(defaultRule("bodyweight").step).toBe("reps");
    expect(defaultRule("weighted")).toMatchObject({ v: 1, repStep: 1, sessionsToEarn: 3 });
    expect(defaultRule("weighted").miss).toBeUndefined();
    expect(defaultRule("weighted").deload).toBeUndefined();
  });
});
