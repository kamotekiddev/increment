import { defaultRule } from "../engine";
import { session } from "../engine/testing";
import type { HistorySession } from "../engine";
import { rulePreview, rulePreviewParts, type RulePreviewInput } from "./rulePreview";

const benchPlan = { sets: 3, repMin: 6, repMax: 8 };

/** Last bench press: 62.5 kg × 8, 8, 8 against a 62.5 kg × 8 Target (one clean workout). */
const benchHistory: HistorySession[] = [session("2026-11-16", { weightKg: 62.5, reps: 8 }, [8, 8, 8])];

function preview(overrides: Partial<RulePreviewInput> = {}): string {
  return rulePreview({
    rule: { ...defaultRule("weighted"), sessionsToEarn: 1 },
    planned: benchPlan,
    loadType: "weighted",
    history: benchHistory,
    unit: "kg",
    step: 2.5,
    ...overrides,
  });
}

describe("rulePreview", () => {
  it("reads the next Target and the stepped-up one with the chosen step, as the mockup does", () => {
    const fresh = [session("2026-11-16", { weightKg: 62.5, reps: 8 }, [8, 7, 7])];
    expect(preview({ history: fresh })).toBe("Next session: 62.5 kg × 6–8. Hit 8 on every set and it becomes 65 kg.");
  });

  it("steps to the next multiple of the chosen step above the Target: 62.5 kg with 2 kg becomes 64 kg", () => {
    const fresh = [session("2026-11-16", { weightKg: 62.5, reps: 8 }, [8, 7, 7])];
    expect(preview({ history: fresh, step: 2 })).toBe("Next session: 62.5 kg × 6–8. Hit 8 on every set and it becomes 64 kg.");
  });

  it("says how many clean workouts in a row earn the step when it is more than one", () => {
    const fresh = [session("2026-11-16", { weightKg: 60, reps: 8 }, [8, 7, 7])];
    expect(preview({ rule: defaultRule("weighted"), history: fresh })).toBe(
      "Next session: 60 kg × 6–8. Hit 8 on every set 3 workouts in a row and it becomes 62.5 kg.",
    );
  });

  it("shows the Target in lb with the lb step after a unit switch: 62.5 kg is 135 lb, then 140 lb", () => {
    const fresh = [session("2026-11-16", { weightKg: 62.5, reps: 8 }, [8, 7, 7])];
    expect(preview({ history: fresh, unit: "lb", step: 5 })).toBe(
      "Next session: 135 lb × 6–8. Hit 8 on every set and it becomes 140 lb.",
    );
  });

  it("writes a single rep count when the rep range is one number", () => {
    const fresh = [session("2026-11-16", { weightKg: 100, reps: 5 }, [5, 4, 4])];
    expect(preview({ planned: { sets: 3, repMin: 5, repMax: 5 }, history: fresh, step: 5 })).toBe(
      "Next session: 100 kg × 5. Hit 5 on every set and it becomes 105 kg.",
    );
  });

  it("with no past workout, says the first session sets the weight and what each step adds", () => {
    expect(preview({ history: [], step: 2 })).toBe("Your first session sets the starting weight. Each step adds 2 kg.");
    expect(preview({ history: [], unit: "lb", step: 5 })).toBe("Your first session sets the starting weight. Each step adds 5 lb.");
  });

  it("for a bodyweight exercise, previews reps", () => {
    const pullUps = [session("2026-11-16", { weightKg: 0, reps: 8 }, [8, 7, 7], { weightKg: 0 })];
    expect(preview({ rule: { ...defaultRule("bodyweight"), sessionsToEarn: 1 }, loadType: "bodyweight", planned: { sets: 3, repMin: 6, repMax: 10 }, history: pullUps })).toBe(
      "Next session: 8 reps. Hit 8 on every set and it becomes 9 reps.",
    );
    expect(preview({ rule: defaultRule("bodyweight"), loadType: "bodyweight", history: [] })).toBe(
      "Your first session sets the starting reps. Each step adds 1 rep.",
    );
  });

  it("at the top of the rep range with nothing left to add, shows only the next Target", () => {
    const pullUps = [session("2026-11-16", { weightKg: 0, reps: 10 }, [10, 9, 9], { weightKg: 0 })];
    expect(preview({ rule: defaultRule("bodyweight"), loadType: "bodyweight", planned: { sets: 3, repMin: 6, repMax: 10 }, history: pullUps })).toBe(
      "Next session: 10 reps.",
    );
  });

  it("marks the next Target as the strong part, as the mockup sets it in bold", () => {
    const fresh = [session("2026-11-16", { weightKg: 62.5, reps: 8 }, [8, 7, 7])];
    const input: RulePreviewInput = {
      rule: { ...defaultRule("weighted"), sessionsToEarn: 1 },
      planned: benchPlan,
      loadType: "weighted",
      history: fresh,
      unit: "kg",
      step: 2.5,
    };
    expect(rulePreviewParts(input)).toEqual({
      lead: "Next session: ",
      strong: "62.5 kg × 6–8",
      rest: ". Hit 8 on every set and it becomes 65 kg.",
    });
  });
});
