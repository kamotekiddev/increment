import type { LoadType, OverloadRule, Step } from "./types";

/** Bodyweight exercises can only step by reps. */
export function effectiveStep(step: Step, loadType: LoadType): Step {
  return loadType === "bodyweight" ? "reps" : step;
}

/** The default rule a routine exercise starts with. The step comes from the exercise's load type. */
export function defaultRule(loadType: LoadType): OverloadRule {
  return {
    v: 1,
    step: loadType === "weighted" ? "weight" : "reps",
    repStep: 1,
    sessionsToEarn: 3,
  };
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);
const isInt = (v: unknown, min: number, max = Infinity): v is number => typeof v === "number" && Number.isInteger(v) && v >= min && v <= max;
const isPercent = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v) && v >= 0 && v <= 100;

/**
 * The stored rule JSON as an `OverloadRule`, or null when it isn't one (wrong version, step, or a number out of the
 * ranges in `types.ts`). Pure; used to check a rule that comes from outside the app, such as a backup file.
 */
export function parseOverloadRule(raw: unknown): OverloadRule | null {
  if (!isObj(raw) || raw.v !== 1) return null;
  if (raw.step !== "weight" && raw.step !== "reps" && raw.step !== "both") return null;
  if (!isInt(raw.repStep, 1, 3) || !isInt(raw.sessionsToEarn, 1, 5)) return null;
  const rule: OverloadRule = { v: 1, step: raw.step, repStep: raw.repStep, sessionsToEarn: raw.sessionsToEarn };
  if (raw.miss !== undefined) {
    const miss = raw.miss;
    if (!isObj(miss) || !isInt(miss.after, 1) || !isObj(miss.action)) return null;
    if (miss.action.kind === "keep") rule.miss = { after: miss.after, action: { kind: "keep" } };
    else if (miss.action.kind === "drop" && isPercent(miss.action.percent)) rule.miss = { after: miss.after, action: { kind: "drop", percent: miss.action.percent } };
    else return null;
  }
  if (raw.deload !== undefined) {
    const deload = raw.deload;
    if (!isObj(deload) || !isInt(deload.everyWeeks, 1) || !isPercent(deload.percent)) return null;
    rule.deload = { everyWeeks: deload.everyWeeks, percent: deload.percent };
  }
  return rule;
}
