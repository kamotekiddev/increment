import { sameWeight } from "./rounding";
import type { HistorySession, Outcome, Planned } from "./types";

/**
 * Judge one past workout against the Target it was shown.
 * - baseline: no Target was shown, so there is nothing to judge.
 * - deload: skipped by streaks and miss counts.
 * - Only the first `planned.sets` working sets are judged; extra sets are ignored.
 * - clean: every judged set is at or above the Target weight and reps.
 * - miss: fewer working sets than planned, or any judged set below repMin.
 * - hold: everything else (short of the Target, but inside the rep range).
 */
export function classify(session: HistorySession, planned: Planned): Outcome {
  if (session.isDeload) return "deload";
  if (!session.target) return "baseline";
  const target = session.target;
  const working = session.sets.filter((s) => s.done && !s.isWarmup);
  if (working.length < planned.sets) return "miss";
  const judged = working.slice(0, planned.sets);
  if (judged.some((s) => s.reps < planned.repMin)) return "miss";
  const clean = judged.every(
    (s) => (s.weightKg > target.weightKg || sameWeight(s.weightKg, target.weightKg)) && s.reps >= target.reps,
  );
  return clean ? "clean" : "hold";
}
