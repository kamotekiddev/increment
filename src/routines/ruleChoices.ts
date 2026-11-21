import type { LoadType, OverloadRule, Step } from "../engine";
import { jumpPatch, type Jumps, type Unit } from "../units";

/** How it progresses, as the Overload rule panel names it. */
export type RuleType = "weight-first" | "double" | "reps-only";

/** What the Overload rule panel sets, besides "Add each time". */
export interface RuleChoices {
  type: RuleType;
  /** "Drop 10%" after two misses in a row; false is "Keep the weight" (no miss rule). */
  missDrop: boolean;
  /** Deload weeks on. */
  deload: boolean;
}

const STEP_OF: Record<RuleType, Step> = { "weight-first": "weight", double: "both", "reps-only": "reps" };
const TYPE_OF: Record<Step, RuleType> = { weight: "weight-first", both: "double", reps: "reps-only" };

/** "If you miss twice in a row: Drop 10%". */
export const MISS_DROP: NonNullable<OverloadRule["miss"]> = { after: 2, action: { kind: "drop", percent: 10 } };
/** "Every 6 weeks, one workout at 60%": 40% lighter. */
export const DELOAD: NonNullable<OverloadRule["deload"]> = { everyWeeks: 6, percent: 40 };

/** Pure: the panel's choices for a saved rule. A miss rule that keeps the weight reads as Keep the weight. */
export function ruleChoices(rule: OverloadRule): RuleChoices {
  return { type: TYPE_OF[rule.step], missDrop: rule.miss?.action.kind === "drop", deload: rule.deload !== undefined };
}

/**
 * Pure: `rule` with the panel's choices applied. The version, rep step and clean workouts stay as they were. Keep
 * the weight and Deload off leave the rule without a miss rule or deload (off, as the default rule has them); a
 * drop or deload already saved stays as saved.
 */
export function withChoices(rule: OverloadRule, choices: RuleChoices): OverloadRule {
  const { miss, deload, ...rest } = rule;
  const next: OverloadRule = { ...rest, v: 1, step: STEP_OF[choices.type] };
  if (choices.missDrop) next.miss = miss?.action.kind === "drop" ? miss : MISS_DROP;
  if (choices.deload) next.deload = deload ?? DELOAD;
  return next;
}

/**
 * Pure: the Jump columns Save rule writes. A weighted exercise saves the Jump chosen in "Add each time" as only that
 * unit's column (`jumpPatch`). A bodyweight exercise shows no "Add each time", so it saves none: both stay null.
 */
export function jumpToSave(loadType: LoadType, unit: Unit, jump: number): Partial<Jumps> {
  return loadType === "bodyweight" ? {} : jumpPatch(unit, jump);
}
