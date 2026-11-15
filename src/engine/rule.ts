import type { LoadType, OverloadRule, Step } from "./types";

/** Bodyweight exercises can only step by reps. */
export function effectiveStep(step: Step, loadType: LoadType): Step {
  return loadType === "bodyweight" ? "reps" : step;
}

/** The free rule. The step comes from the exercise's load type. */
export function defaultRule(loadType: LoadType): OverloadRule {
  return {
    v: 1,
    step: loadType === "weighted" ? "weight" : "reps",
    repStep: 1,
    sessionsToEarn: 3,
  };
}
