import { classify, nextTarget, stepUp, withoutAddedWeight } from "../engine";
import type { HistorySession, LoadType, LoggedSet, NextTargetInput, OverloadRule, Outcome, Planned, Target } from "../engine";
import type { Unit } from "../units";
import { cardLine } from "./cardLine";

/** One exercise of the finished workout, as plain inputs. */
export interface SummaryExercise {
  id: number;
  name: string;
  /** Every set saved for this exercise in this workout (including extra sets beyond the plan). */
  sets: LoggedSet[];
  planned: Planned;
  rule: OverloadRule;
  loadType: LoadType;
  /** The Jump, in kg. */
  jumpKg: number;
  /** Engine history for this routine exercise, newest first. history[0] is this workout, with its progressAccepted. */
  history: HistorySession[];
}

export interface SummaryInput {
  /** Epoch ms. */
  startedAt: number;
  finishedAt: number;
  /** In workout order. */
  exercises: SummaryExercise[];
  /** The unit the card lines write weights in. Totals stay in kg. */
  unit: Unit;
}

export interface SummaryHeader {
  /** Whole minutes, never negative. */
  durationMinutes: number;
  /** Done working sets across the workout. */
  sets: number;
  /** Sum of weight × reps over done working sets, in kg. */
  volumeKg: number;
  totalReps: number;
  /** Volume is 0 (bodyweight only), so show total reps instead of "0 kg". */
  showTotalReps: boolean;
}

/** The question on a card once progression is Earned. It stays after an answer so the lifter can flip it. */
export interface SummaryOffer {
  /** The stepped-up Target. */
  target: Target;
  /** True when the step is accepted; false is Decline, answered or not. */
  accepted: boolean;
}

export interface SummaryCard {
  /** The workout_exercises row id; pass it to answer(). */
  workoutExerciseId: number;
  name: string;
  outcome: Outcome;
  /** Clean workouts in a row at this Target, including this one. Null unless the card is Clean. */
  streak: number | null;
  line: string;
  /** The Target the next workout will show. Null when there is nothing to base one on. */
  next: Target | null;
  offer: SummaryOffer | null;
}

/** One Offer screen: an exercise that earned a heavier weight, in workout order. */
export interface OfferItem {
  /** The workout_exercises row id; pass it to answerOffer(). */
  workoutExerciseId: number;
  name: string;
  /** Clean workouts in a row at the current Target, including this one. */
  streak: number;
  /** The Target the lifter just worked at. */
  current: Target;
  /** The stepped-up Target. */
  stepped: Target;
  /** True once the lifter tapped Go up; false is Stay, answered or not. */
  accepted: boolean;
}

export interface Summary {
  header: SummaryHeader;
  cards: SummaryCard[];
  /** The Offers in workout order. Answered Offers stay listed so each screen keeps its place. */
  offers: OfferItem[];
}

const doneWorking = (sets: LoggedSet[]) => sets.filter((s) => s.done && !s.isWarmup);

const sameTarget = (a: Target, b: Target) => Math.abs(a.weightKg - b.weightKg) < 1e-6 && a.reps === b.reps;

/** Clean workouts in a row at the latest regular Target. Mirrors the engine's Streak. */
function streakLength(history: HistorySession[], planned: Planned): number {
  const regular = history.filter((s) => !s.isDeload);
  const ref = regular[0]?.target;
  if (!ref) return 0;
  let count = 0;
  for (const s of regular) {
    if (!s.target || !sameTarget(s.target, ref) || classify(s, planned) !== "clean") break;
    count++;
  }
  return count;
}

/** A bodyweight exercise reads weight logged before the split as 0, as the engine does, so the Streak matches it. */
const asLogged = (ex: SummaryExercise): SummaryExercise =>
  ex.loadType === "bodyweight" ? { ...ex, history: withoutAddedWeight(ex.history) } : ex;

function buildCard(ex: SummaryExercise, unit: Unit): { card: SummaryCard; offer: OfferItem | null } {
  const input: NextTargetInput = { rule: ex.rule, planned: ex.planned, loadType: ex.loadType, history: ex.history, jumpKg: ex.jumpKg };
  const current = ex.history[0];
  const outcome = classify(current, ex.planned);
  const result = nextTarget(input);

  const streak = outcome === "clean" ? streakLength(ex.history, ex.planned) : null;
  // A Deload workout never re-asks an earlier Offer.
  let offer: SummaryOffer | null = null;
  if (outcome !== "deload") {
    if (result.reason === "earned" && result.proposal) offer = { target: result.proposal, accepted: false };
    else if (result.reason === "progressed" && result.target) offer = { target: result.target, accepted: true };
    else if (current.progressAccepted && current.target) {
      // Accepted, but the engine's result has no proposal now (e.g. a Deload is due). Keep the Offer so Accept can flip back to Decline.
      const target = current.acceptedTarget ?? stepUp(current.target, input);
      if (target) offer = { target, accepted: true };
    }
  }

  const stepped = offer?.target ?? (streak !== null && current.target ? stepUp(current.target, input) : null);
  const remaining = streak !== null ? Math.max(0, ex.rule.sessionsToEarn - streak) : null;
  const line = cardLine({ outcome, reason: result.reason, next: result.target, stepped, remaining, unit });
  const card: SummaryCard = { workoutExerciseId: ex.id, name: ex.name, outcome, streak, line, next: result.target, offer };
  const item: OfferItem | null =
    offer && current.target
      ? { workoutExerciseId: ex.id, name: ex.name, streak: streak ?? 0, current: current.target, stepped: offer.target, accepted: offer.accepted }
      : null;
  return { card, offer: item };
}

/** The summary the lifter sees right after Finish: a header and one card per exercise with done sets. */
export function buildSummary({ startedAt, finishedAt, exercises, unit }: SummaryInput): Summary {
  const worked = exercises.filter((ex) => doneWorking(ex.sets).length > 0);
  const all = worked.flatMap((ex) => doneWorking(ex.sets));
  const volumeKg = all.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
  const built = worked.map((ex) => buildCard(asLogged(ex), unit));
  return {
    header: {
      durationMinutes: Math.max(0, Math.floor((finishedAt - startedAt) / 60_000)),
      sets: all.length,
      volumeKg,
      totalReps: all.reduce((sum, s) => sum + s.reps, 0),
      showTotalReps: volumeKg === 0,
    },
    cards: built.map((b) => b.card),
    offers: built.flatMap((b) => (b.offer ? [b.offer] : [])),
  };
}
