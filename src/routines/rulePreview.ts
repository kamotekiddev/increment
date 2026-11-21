import { effectiveStep, nextTarget, stepUp, type HistorySession, type LoadType, type NextTargetInput, type OverloadRule, type Planned, type Target } from "../engine";
import { formatNumber, formatWithUnit, toKg, type Unit } from "../units";
import { repsText } from "../workout/repsText";

export interface RulePreviewInput {
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

/** The preview split so the next Target can be set in bold: `lead` + `strong` + `rest` is the whole line. */
export interface RulePreviewParts {
  lead: string;
  /** The next Target ("62.5 kg × 6–8"); empty when there is none yet. */
  strong: string;
  rest: string;
}

/**
 * Pure: the Overload rule panel's live preview. The engine's next Target for this routine exercise and the one it
 * steps up to, both with the chosen step, in the lifter's unit: "Next session: 62.5 kg × 6–8. Hit 8 on every set
 * and it becomes 65 kg." With no past workout there is no Target yet, so it says what each step adds.
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
  const { target, reason } = nextTarget(engineInput);
  if (!target) {
    const rest =
      effectiveStep(rule.step, loadType) === "reps"
        ? `Your first session sets the starting reps. Each step adds ${repsText(rule.repStep)}.`
        : `Your first session sets the starting weight. Each step adds ${formatNumber(step)} ${unit}.`;
    return { lead: "", strong: "", rest };
  }
  const lead = "Next session: ";
  const strong = nextText(target, input);
  const stepped = reason === "deload" ? null : stepUp(target, engineInput);
  if (!stepped) return { lead, strong, rest: "." };
  const n = rule.sessionsToEarn;
  const when = n > 1 ? ` ${n} workouts in a row` : "";
  return { lead, strong, rest: `. Hit ${target.reps} on every set${when} and it becomes ${steppedText(stepped, input)}.` };
}

/** `rulePreviewParts` as one line of text. */
export function rulePreview(input: RulePreviewInput): string {
  const { lead, strong, rest } = rulePreviewParts(input);
  return lead + strong + rest;
}
