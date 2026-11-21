import { nearestMultiple, sameWeight } from "./rounding";
import type { HistorySession, LoggedSet, NextTargetInput, Outcome, Planned } from "./types";

/** The lifter's current unit and its Jump: what a Target set in the other unit was shown as. */
export type JudgeIn = Pick<NextTargetInput, "unit" | "jumpKg">;

/**
 * The weight a set must reach. A set logged in the Target's unit is judged against the Target as stored. A set
 * logged in the current unit after a mid-workout switch was lifted against the Target as shown on that unit's
 * grid, so it is judged against that: a 100 kg Target lifted as the 220 lb shown (99.79 kg) meets it.
 */
function barKg(set: LoggedSet, session: HistorySession, judgeIn: JudgeIn | undefined): number {
  const targetKg = session.target!.weightKg;
  const shownInOtherUnit = judgeIn && set.unit && set.unit === judgeIn.unit && set.unit !== (session.targetUnit ?? "kg");
  return shownInOtherUnit ? nearestMultiple(targetKg, judgeIn.jumpKg) : targetKg;
}

/**
 * Judge one past workout against the Target it was shown.
 * - baseline: no Target was shown, so there is nothing to judge.
 * - deload: skipped by streaks and miss counts.
 * - Only the first `planned.sets` working sets are judged; extra sets are ignored.
 * - clean: every judged set is at or above the Target weight (as shown in the set's unit) and reps.
 * - miss: fewer working sets than planned, or any judged set below repMin.
 * - hold: everything else (short of the Target, but inside the rep range).
 */
export function classify(session: HistorySession, planned: Planned, judgeIn?: JudgeIn): Outcome {
  if (session.isDeload) return "deload";
  if (!session.target) return "baseline";
  const target = session.target;
  const working = session.sets.filter((s) => s.done && !s.isWarmup);
  if (working.length < planned.sets) return "miss";
  const judged = working.slice(0, planned.sets);
  if (judged.some((s) => s.reps < planned.repMin)) return "miss";
  const clean = judged.every((s) => {
    const bar = barKg(s, session, judgeIn);
    return (s.weightKg > bar || sameWeight(s.weightKg, bar)) && s.reps >= target.reps;
  });
  return clean ? "clean" : "hold";
}
