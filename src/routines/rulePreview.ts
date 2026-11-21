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
  type Target,
} from "../engine";
import { formatNumber, formatWithUnit, toKg, type Unit } from "../units";
import { repsText } from "../workout/repsText";

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
  /** "Add each time" as chosen, in `unit`. */
  step: number;
}

function repRange({ repMin, repMax }: Planned): string {
  return repMin === repMax ? String(repMin) : `${repMin}–${repMax}`;
}

/** The next Target: "62.5 kg × 6–8", or "8 reps" for a bodyweight exercise. */
function nextText(target: Target, input: RulePreviewInput): string {
  if (input.loadType === "bodyweight") return repsText(target.reps);
  return `${formatWithUnit(target.weightKg, input.unit)} × ${repRange(input.planned)}`;
}

/** The stepped-up Target: "65 kg" when only weight is added, "62.5 kg × 9" when reps are, "9 reps" for bodyweight. */
function steppedText(stepped: Target, input: RulePreviewInput): string {
  if (input.loadType === "bodyweight") return repsText(stepped.reps);
  const weight = formatWithUnit(stepped.weightKg, input.unit);
  return input.rule.step === "weight" ? weight : `${weight} × ${stepped.reps}`;
}

/** What one step adds with no Target yet: "2 kg", "1 rep", or "2.5 kg and 1 rep". */
function addsText({ rule, loadType, unit, step }: RulePreviewInput): string {
  const weight = `${formatNumber(step)} ${unit}`;
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
  if (rule.deload) {
    out += ` Every ${rule.deload.everyWeeks} weeks, one Deload workout at ${formatNumber(100 - rule.deload.percent)}%.`;
  }
  return out;
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
 * steps up to, both with the chosen rule and step, in the lifter's unit: "Next session: 62.5 kg × 6–8. Hit 8 on
 * every set and it becomes 65 kg." It counts only the clean workouts still needed, then adds the miss rule and
 * Deload when they are on. A due Deload is the next session. With no past workout there is no Target yet, so it
 * says what each step adds.
 */
export function rulePreviewParts(input: RulePreviewInput): RulePreviewParts {
  const { rule, loadType, unit, step } = input;
  const engineInput: NextTargetInput = {
    rule,
    planned: input.planned,
    loadType,
    history: input.history,
    jumpKg: toKg(step, unit),
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
  // Earned and declined: the next clean workout brings the Offer back.
  const stepped = reason === "earned" ? proposal : stepUp(target, engineInput);
  if (!stepped) return { lead, strong, rest: "." + extras };
  const n = reason === "earned" ? 1 : reason === "on-track" ? rule.sessionsToEarn - cleanStreak(engineInput) : rule.sessionsToEarn;
  const when = n > 1 ? ` ${n} workouts in a row` : "";
  return { lead, strong, rest: `. Hit ${target.reps} on every set${when} and it becomes ${steppedText(stepped, input)}.${extras}` };
}

/** `rulePreviewParts` as one line of text. */
export function rulePreview(input: RulePreviewInput): string {
  const { lead, strong, rest } = rulePreviewParts(input);
  return lead + strong + rest;
}
