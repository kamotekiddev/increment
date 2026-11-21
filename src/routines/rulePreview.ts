import {
  cleanStreak,
  effectiveStep,
  missDropKg,
  nextTarget,
  stepUp,
  type HistorySession,
  type LoadType,
  type NextTargetInput,
  type OverloadRule,
  type Planned,
  type Reason,
  type Target,
} from "../engine";
import { formatNumber, formatWithUnit, toKg, type Unit } from "../units";
import { repsText } from "../workout/repsText";
import { repRangeText } from "./setupText";

export interface RulePreviewInput {
  /** The rule as set in the panel (not yet saved). */
  rule: OverloadRule;
  /** The sets and rep range on the Exercise setup sheet, as currently set (not yet saved). */
  planned: Planned;
  loadType: LoadType;
  /** This routine exercise's past workouts, newest first: the history Start uses. */
  history: HistorySession[];
  /** The lifter's current unit. */
  unit: Unit;
  /** The Jump chosen in "Add each time", in `unit`. */
  jump: number;
}

/**
 * The Deload as a sentence without the closing period: "Every 6 weeks, one workout at 60%" as the panel's Deload
 * weeks row says it, or with `named` "Every 6 weeks, one Deload workout at 60%" as the preview says it.
 */
export function deloadText({ everyWeeks, percent }: NonNullable<OverloadRule["deload"]>, named = false): string {
  return `Every ${everyWeeks} weeks, one ${named ? "Deload " : ""}workout at ${formatNumber(100 - percent)}%`;
}

/** The next Target: "62.5 kg × 6–8", or "8 reps" for a bodyweight exercise. */
function nextText(target: Target, input: RulePreviewInput): string {
  if (input.loadType === "bodyweight") return repsText(target.reps);
  return `${formatWithUnit(target.weightKg, input.unit)} × ${repRangeText(input.planned)}`;
}

/** The stepped-up Target: "65 kg" when only weight is added, "62.5 kg × 9" when reps are, "9 reps" for bodyweight. */
function steppedText(stepped: Target, input: RulePreviewInput): string {
  if (input.loadType === "bodyweight") return repsText(stepped.reps);
  const weight = formatWithUnit(stepped.weightKg, input.unit);
  return input.rule.step === "weight" ? weight : `${weight} × ${stepped.reps}`;
}

/** What one step adds with no Target yet: "2 kg", "1 rep", or "2.5 kg and 1 rep". */
function addsText({ rule, loadType, unit, jump }: RulePreviewInput): string {
  const weight = `${formatNumber(jump)} ${unit}`;
  const reps = repsText(rule.repStep);
  const how = effectiveStep(rule.step, loadType);
  return how === "reps" ? reps : how === "both" ? `${weight} and ${reps}` : weight;
}

function timesText(n: number): string {
  return n === 1 ? "once" : n === 2 ? "twice" : `${n} times`;
}

/**
 * The miss rule and Deload as sentences, each with a leading space; weighted only, since both change only weight.
 * "Miss twice in a row and it drops to 55 kg." (or "drops 10%" with no Target yet) and "Every 6 weeks, one Deload
 * workout at 60%."
 */
function extrasText(input: RulePreviewInput, target: Target | null, jumpKg: number): string {
  const { rule, loadType, unit } = input;
  if (loadType === "bodyweight") return "";
  let out = "";
  if (rule.miss?.action.kind === "drop") {
    const { percent } = rule.miss.action;
    const to = target ? `to ${formatWithUnit(missDropKg(target.weightKg, percent, jumpKg), unit)}` : `${formatNumber(percent)}%`;
    out += ` Miss ${timesText(rule.miss.after)} in a row and it drops ${to}.`;
  }
  if (rule.deload) out += ` ${deloadText(rule.deload, true)}.`;
  return out;
}

/**
 * The clean workouts still needed to earn the step, with a leading space. On track, the engine's Streak counts
 * toward it: " 2 more workouts", " 1 more workout". A new or restarted Streak needs them all: " 3 workouts in a
 * row", or nothing when one is enough.
 */
function stillNeeded(reason: Reason, input: NextTargetInput): string {
  const n = input.rule.sessionsToEarn;
  if (reason === "on-track") {
    const left = n - cleanStreak(input);
    if (left < n) return ` ${left} more ${left === 1 ? "workout" : "workouts"}`;
  }
  return n > 1 ? ` ${n} workouts in a row` : "";
}

/** The preview split so the next Target can be set in bold: `lead` + `strong` + `rest` is the whole line. */
export interface RulePreviewParts {
  lead: string;
  /** The next Target ("62.5 kg × 6–8"); empty when there is none yet. */
  strong: string;
  rest: string;
}

/**
 * Pure: the Overload rule panel's live preview. The engine's next Target for this routine exercise and the one it
 * steps up to, both with the chosen rule and Jump, in the lifter's unit: "Next session: 62.5 kg × 6–8. Hit 8 on
 * every set and it becomes 65 kg." It counts only the clean workouts still needed, then adds the miss rule and
 * Deload when they are on. A due Deload is the next session. With no past workout there is no Target yet, so it
 * says what each step adds.
 */
export function rulePreviewParts(input: RulePreviewInput): RulePreviewParts {
  const { rule, loadType, unit, jump } = input;
  const engineInput: NextTargetInput = {
    rule,
    planned: input.planned,
    loadType,
    history: input.history,
    jumpKg: toKg(jump, unit),
    unit,
  };
  const { target, proposal, reason } = nextTarget(engineInput);
  if (!target) {
    const starting = effectiveStep(rule.step, loadType) === "reps" ? "reps" : "weight";
    const rest = `Your first session sets the starting ${starting}. Each step adds ${addsText(input)}.`;
    return { lead: "", strong: "", rest: rest + extrasText(input, null, engineInput.jumpKg) };
  }
  if (reason === "deload") {
    return { lead: "Deload next session: ", strong: nextText(target, input), rest: ". It does not count toward your Streak." };
  }
  const lead = "Next session: ";
  const strong = nextText(target, input);
  const extras = extrasText(input, target, engineInput.jumpKg);
  if (reason === "earned" && proposal) {
    return { lead, strong, rest: `. You've earned ${steppedText(proposal, input)}; it's offered at Start.${extras}` };
  }
  const stepped = stepUp(target, engineInput);
  if (!stepped) return { lead, strong, rest: "." + extras };
  return { lead, strong, rest: `. Hit ${target.reps} on every set${stillNeeded(reason, engineInput)} and it becomes ${steppedText(stepped, input)}.${extras}` };
}
