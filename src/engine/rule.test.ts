import { defaultRule, parseOverloadRule } from "./rule";

describe("parseOverloadRule", () => {
  it("accepts the default rules and the panel's miss and deload rules", () => {
    expect(parseOverloadRule(defaultRule("weighted"))).toEqual(defaultRule("weighted"));
    expect(parseOverloadRule(defaultRule("bodyweight"))).toEqual(defaultRule("bodyweight"));
    const full = {
      v: 1,
      step: "both",
      repStep: 2,
      sessionsToEarn: 5,
      miss: { after: 2, action: { kind: "drop", percent: 10 } },
      deload: { everyWeeks: 6, percent: 40 },
    };
    expect(parseOverloadRule(full)).toEqual(full);
    expect(parseOverloadRule({ ...full, miss: { after: 3, action: { kind: "keep" } } })).not.toBeNull();
  });

  it("refuses anything that is not a rule", () => {
    const ok = defaultRule("weighted");
    const bad: unknown[] = [
      null,
      "weight",
      [],
      { ...ok, v: 2 },
      { ...ok, step: "sideways" },
      { ...ok, repStep: 0 },
      { ...ok, repStep: 4 },
      { ...ok, repStep: 1.5 },
      { ...ok, sessionsToEarn: 0 },
      { ...ok, sessionsToEarn: 6 },
      { ...ok, miss: { after: 0, action: { kind: "keep" } } },
      { ...ok, miss: { after: 2, action: { kind: "drop", percent: 120 } } },
      { ...ok, miss: { after: 2, action: { kind: "nope" } } },
      { ...ok, deload: { everyWeeks: 0, percent: 40 } },
      { ...ok, deload: { everyWeeks: 6, percent: -1 } },
      { v: 1, kind: "double" },
    ];
    for (const rule of bad) expect(parseOverloadRule(rule)).toBeNull();
  });
});
