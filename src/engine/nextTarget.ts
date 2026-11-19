import { classify } from "./outcome";
import { floorToMultiple, nearestMultiple, nextMultipleAbove, sameWeight } from "./rounding";
import { effectiveStep } from "./rule";
import type { HistorySession, NextTargetInput, Planned, Target, TargetResult, WeightUnit } from "./types";

const sameTarget = (a: Target, b: Target) => sameWeight(a.weightKg, b.weightKg) && a.reps === b.reps;

/** Monday-based week number from a YYYY-MM-DD date. Pure integer math, no timezones. */
export function weekIndex(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  const day = Math.floor(Date.UTC(y, m - 1, d) / 86_400_000);
  return Math.floor((day + 3) / 7); // 1970-01-01 was a Thursday
}

/**
 * A bodyweight exercise has no weight. Sets and Targets logged with added weight before the exercise
 * was split (Pull-up and Weighted pull-up) read as 0, so nothing hidden is carried forward.
 */
export function withoutAddedWeight(history: HistorySession[]): HistorySession[] {
  return history.map((s) => ({
    ...s,
    target: s.target ? { ...s.target, weightKg: 0 } : null,
    acceptedTarget: s.acceptedTarget ? { ...s.acceptedTarget, weightKg: 0 } : s.acceptedTarget,
    sets: s.sets.map((set) => ({ ...set, weightKg: 0 })),
  }));
}

/** The next step up from `base`: what to offer, or null when no step is possible. */
export function stepUp(target: Target, input: NextTargetInput): Target | null {
  const { rule, planned, loadType, jumpKg } = input;
  const base = loadType === "bodyweight" ? { ...target, weightKg: 0 } : target;
  const step = effectiveStep(rule.step, loadType);
  const reps = Math.min(base.reps + rule.repStep, planned.repMax);
  const canAddReps = base.reps < planned.repMax;
  if (step === "weight") return { weightKg: nextMultipleAbove(base.weightKg, jumpKg), reps: base.reps };
  if (step === "reps") return canAddReps ? { weightKg: base.weightKg, reps } : null;
  return { weightKg: nextMultipleAbove(base.weightKg, jumpKg), reps };
}

/** First workout: the lifter's own weight becomes the baseline Target. */
function baselineTarget(session: HistorySession, planned: Planned): Target | null {
  const working = session.sets.filter((s) => s.done && !s.isWarmup);
  if (working.length === 0) return null;
  const weightKg = Math.max(...working.map((s) => s.weightKg));
  const atWeight = working.filter((s) => sameWeight(s.weightKg, weightKg));
  const lowest = Math.min(...atWeight.map((s) => s.reps));
  return { weightKg, reps: Math.min(Math.max(lowest, planned.repMin), planned.repMax) };
}

function streakLength(sessions: HistorySession[], planned: Planned): number {
  const ref = sessions[0]?.target;
  if (!ref) return 0;
  let count = 0;
  for (const s of sessions) {
    if (!s.target || !sameTarget(s.target, ref)) break;
    if (classify(s, planned) !== "clean") break;
    count++;
  }
  return count;
}

/** Misses in a row at the same weight. Holds neither count nor reset; a clean workout resets. */
function missCount(sessions: HistorySession[], planned: Planned): number {
  const ref = sessions[0]?.target;
  if (!ref) return 0;
  let count = 0;
  for (const s of sessions) {
    if (!s.target || !sameWeight(s.target.weightKg, ref.weightKg)) break;
    const outcome = classify(s, planned);
    if (outcome === "clean") break;
    if (outcome === "miss") count++;
  }
  return count;
}

function deloadDue(history: HistorySession[], everyWeeks: number): boolean {
  const lastDeload = history.findIndex((s) => s.isDeload);
  const since = lastDeload === -1 ? history : history.slice(0, lastDeload);
  const weeks = new Set(since.map((s) => weekIndex(s.date)));
  return weeks.size >= everyWeeks;
}

/**
 * A past Target as the lifter can load it now. One set in another unit than the current one snaps to the
 * nearest multiple of the Jump (a tie rounds up): 10 kg is 22.05 lb, which a 5 lb grid shows as 20 lb. One
 * set in the current unit is kept as is, even if the Jump changed since. A Target already on the grid, and
 * a bodyweight 0, are unchanged.
 */
export function inCurrentUnit(target: Target, setIn: WeightUnit | undefined, input: Pick<NextTargetInput, "unit" | "jumpKg">): Target {
  if ((setIn ?? "kg") === input.unit) return target;
  return { ...target, weightKg: nearestMultiple(target.weightKg, input.jumpKg) };
}

export function nextTarget(given: NextTargetInput): TargetResult {
  const input = given.loadType === "bodyweight" ? { ...given, history: withoutAddedWeight(given.history) } : given;
  const { rule, jumpKg } = input;
  const regular = input.history.filter((s) => !s.isDeload);
  const latest = regular[0];
  if (!latest) return { target: null, proposal: null, reason: "no-history" };

  const result = regularTarget(input, regular);
  if (rule.deload && result.target && deloadDue(input.history, rule.deload.everyWeeks)) {
    const lighter = floorToMultiple(result.target.weightKg * (1 - rule.deload.percent / 100), jumpKg);
    return {
      target: { weightKg: Math.min(lighter, result.target.weightKg), reps: result.target.reps },
      proposal: null,
      reason: "deload",
    };
  }
  return result;
}

function regularTarget(input: NextTargetInput, regular: HistorySession[]): TargetResult {
  const { rule, planned, jumpKg } = input;
  const latest = regular[0];
  if (!latest.target) {
    const baseline = baselineTarget(latest, planned);
    return { target: baseline && inCurrentUnit(baseline, latest.targetUnit, input), proposal: null, reason: "baseline" };
  }
  // A Target set in the other unit snaps first, so a step goes one Jump above what Stay would show.
  const base = inCurrentUnit(latest.target, latest.targetUnit, input);
  const earned = streakLength(regular, planned) >= rule.sessionsToEarn;
  const stepped = stepUp(base, input);

  if (earned) {
    // An accepted step keeps the Target the lifter saw, even if the Jump changed since (it snaps only after a unit switch).
    if (latest.progressAccepted && latest.acceptedTarget) {
      return { target: inCurrentUnit(latest.acceptedTarget, latest.targetUnit, input), proposal: null, reason: "progressed" };
    }
    if (!stepped) return { target: base, proposal: null, reason: "at-top-of-range" };
    if (latest.progressAccepted) return { target: stepped, proposal: null, reason: "progressed" };
    return { target: base, proposal: stepped, reason: "earned" };
  }

  const outcome = classify(latest, planned);
  if (outcome === "miss" && rule.miss && missCount(regular, planned) >= rule.miss.after) {
    if (rule.miss.action.kind === "keep") return { target: base, proposal: null, reason: "miss-keep" };
    const dropped = floorToMultiple(base.weightKg * (1 - rule.miss.action.percent / 100), jumpKg);
    const weightKg = dropped < base.weightKg ? dropped : Math.max(0, base.weightKg - jumpKg);
    return { target: { weightKg, reps: base.reps }, proposal: null, reason: "miss-drop" };
  }
  const reason = outcome === "miss" ? "miss" : outcome === "hold" ? "hold" : "on-track";
  return { target: base, proposal: null, reason };
}
