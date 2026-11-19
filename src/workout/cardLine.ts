import type { Outcome, Reason, Target } from "../engine";
import { formatWithUnit, type Unit } from "../units";
import { repsText } from "./repsText";

export interface CardLineInput {
  /** How this workout went. */
  outcome: Outcome;
  /** The engine's reason for the next Target. */
  reason: Reason;
  /** The next Target the card shows. */
  next: Target | null;
  /** The stepped-up Target (the Offer's Target, or the one a Clean card is working toward). */
  stepped: Target | null;
  /** Clean workouts still needed to earn the step. Only used with reason on-track. */
  remaining: number | null;
  /** The unit the lifter reads weights in. */
  unit: Unit;
}

/** A Target as the summary writes it: "62.5 kg × 10", or "9 reps" for a bodyweight Target (weight 0). */
export function targetText(target: Target, unit: Unit): string {
  if (target.weightKg === 0) return repsText(target.reps);
  return `${formatWithUnit(target.weightKg, unit)} × ${target.reps}`;
}

/** What "Go up to …" and "Stay at …" name: the weight, or the reps of a bodyweight Target (weight 0). */
export function loadText(target: Target, unit: Unit): string {
  return target.weightKg === 0 ? repsText(target.reps) : formatWithUnit(target.weightKg, unit);
}

/** The Offer screen's heading: a heavier weight when the step adds weight, otherwise more reps (as on a bodyweight exercise). */
export function offerHeading(current: Target, stepped: Target): string {
  return stepped.weightKg > current.weightKg ? "You earned a heavier weight" : "You earned more reps";
}

/** The one short line on a summary card, chosen from the outcome and the engine's reason. */
export function cardLine({ outcome, reason, next, stepped, remaining, unit }: CardLineInput): string {
  if (outcome === "deload") return "Deload workout. It does not count toward your Streak.";
  switch (reason) {
    case "baseline":
      return "First time: baseline set from what you logged.";
    case "on-track": {
      if (!next || remaining === null) return "On track.";
      const base = `${remaining} more at ${targetText(next, unit)}`;
      return stepped ? `${base} to earn ${targetText(stepped, unit)}.` : `${base}.`;
    }
    case "hold":
      return "Held: short of the Target but inside the rep range. Streak restarts, Target stays.";
    case "miss":
      return "Missed: below the rep range or short on sets. Streak restarts, Target stays.";
    case "miss-keep":
      return "Missed again. Your rule keeps the Target.";
    case "miss-drop":
      return next ? `Missed again. Your rule drops the Target to ${targetText(next, unit)}.` : "Missed again. Your rule drops the Target.";
    case "earned":
      return next
        ? `Staying at ${loadText(next, unit)}. The offer comes back after your next clean workout.`
        : "Earned.";
    case "progressed":
      return next ? `Earned. Moving up to ${targetText(next, unit)}.` : "Earned.";
    case "at-top-of-range":
      return "Earned, but you are at the top of your rep range, so there is no step up. Target stays.";
    case "deload":
      return "Next workout is a Deload at a lighter weight. It does not count toward your Streak.";
    case "no-history":
      return "No Target yet.";
  }
}
