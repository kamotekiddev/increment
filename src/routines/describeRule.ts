import type { OverloadRule } from "../engine";

/** Pure: the read-only text for an Overload rule, for example "Adds weight after 3 clean workouts". */
export function describeRule(rule: OverloadRule): string {
  const adds = rule.step === "weight" ? "weight" : rule.step === "reps" ? "reps" : "weight and reps";
  const n = rule.sessionsToEarn;
  return `Adds ${adds} after ${n} clean ${n === 1 ? "workout" : "workouts"}`;
}
