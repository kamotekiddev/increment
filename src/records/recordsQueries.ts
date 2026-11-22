import { and, asc, eq, inArray } from "drizzle-orm";

import { db } from "@/db/client";
import { exercises, sets, workoutExercises, workouts } from "@/db/schema";
import { fromKg, loggedWeightText, weightKg, type Unit } from "@/units";

/** The display name of each Record, as a pill reads it. */
export type RecordName = "Heaviest set" | "1-rep max" | "Most volume" | "Most reps in a set" | "Most reps in a workout";

/** A Workout's new Records by Workout exercise id, in display order. Exercises that set none are left out. */
export type WorkoutRecordTags = Record<number, RecordName[]>;

/** A best and the local date (`YYYY-MM-DD`) of the Workout that set it. */
export interface DatedValue {
  value: number;
  date: string;
}

/** The current Records of an exercise, shown as Progress shows them. */
export type ExerciseRecords =
  | {
      loadType: "weighted";
      /** As History shows a set: `62.5 × 8`, or `≈61.2 × 5` from the other unit. */
      heaviestSet: { text: string; date: string };
      /** Whole number in the asked unit; null when every counted set is above 12 reps. */
      estimatedOneRepMax: DatedValue | null;
      /** Whole number in the asked unit. */
      mostVolume: DatedValue;
    }
  | {
      loadType: "bodyweight";
      mostRepsInSet: DatedValue;
      mostRepsInWorkout: DatedValue;
    };

/** Two weights within a gram are a tie, so float noise from a conversion never makes a record. */
const TOLERANCE_KG = 1e-3;
/** Above this many reps the Epley estimate is too loose to credit. */
const MAX_REPS_FOR_ONE_REP_MAX = 12;

const isMore = (a: number, b: number) => a > b + TOLERANCE_KG;

interface CountedSet {
  workoutId: number;
  workoutExerciseId: number;
  position: number;
  date: string;
  /** In kg, in memory only. */
  kg: number;
  weight: number;
  unit: Unit;
  reps: number;
}

/** What one Workout did on one exercise, for the Records. */
interface Session {
  workoutId: number;
  date: string;
  /** The first Workout exercise of the exercise in this Workout: where its tags go. */
  workoutExerciseId: number;
  heaviest: CountedSet | null;
  oneRepMaxKg: number | null;
  volumeKg: number;
  mostRepsInSet: number;
  totalReps: number;
}

function epley(kg: number, reps: number): number {
  return reps === 1 ? kg : kg * (1 + reps / 30);
}

/** Heaviest set order: more weight wins, then more reps at the same weight. */
function heavierThan(a: CountedSet, b: CountedSet): boolean {
  if (isMore(a.kg, b.kg)) return true;
  if (isMore(b.kg, a.kg)) return false;
  return a.reps > b.reps;
}

/**
 * Whether a done Working set counts: a set with no reps never does, and a weighted exercise ignores a set with no
 * weight (a blank weight is stored as 0). Records, Top set and Progress's "done" all use this one rule.
 */
export function isCountedSet(set: { reps: number; weight: number }, loadType: "weighted" | "bodyweight"): boolean {
  if (set.reps <= 0) return false;
  return loadType === "bodyweight" || set.weight > 0;
}

/**
 * Every counted set of the exercise, grouped per finished Workout, earliest start first (History's order).
 * Only done Working sets of finished Workouts count, across all Routines. A set with no reps never counts, and a
 * weighted exercise ignores a set with no weight (a blank weight is stored as 0).
 */
function sessionsOf(exerciseId: number, loadType: "weighted" | "bodyweight"): Session[] {
  const rows = db
    .select({
      workoutId: workouts.id,
      date: workouts.date,
      workoutExerciseId: workoutExercises.id,
      position: workoutExercises.position,
      weight: sets.weight,
      unit: sets.weightUnit,
      reps: sets.reps,
    })
    .from(sets)
    .innerJoin(workoutExercises, eq(workoutExercises.id, sets.workoutExerciseId))
    .innerJoin(workouts, eq(workouts.id, workoutExercises.workoutId))
    .where(and(eq(sets.exerciseId, exerciseId), eq(sets.done, true), eq(sets.isWarmup, false), eq(workouts.inProgress, false)))
    .orderBy(asc(workouts.startedAt), asc(workouts.id), asc(workoutExercises.position), asc(sets.idx), asc(sets.id))
    .all();

  const sessions = new Map<number, Session>();
  for (const row of rows) {
    if (!isCountedSet(row, loadType)) continue;
    let session = sessions.get(row.workoutId);
    if (!session) {
      session = {
        workoutId: row.workoutId,
        date: row.date,
        workoutExerciseId: row.workoutExerciseId,
        heaviest: null,
        oneRepMaxKg: null,
        volumeKg: 0,
        mostRepsInSet: 0,
        totalReps: 0,
      };
      sessions.set(row.workoutId, session);
    }
    const kg = weightKg({ value: row.weight, unit: row.unit });
    const set: CountedSet = { ...row, kg };
    if (!session.heaviest || heavierThan(set, session.heaviest)) session.heaviest = set;
    if (row.reps <= MAX_REPS_FOR_ONE_REP_MAX) {
      const estimate = epley(kg, row.reps);
      if (session.oneRepMaxKg === null || estimate > session.oneRepMaxKg) session.oneRepMaxKg = estimate;
    }
    session.volumeKg += kg * row.reps;
    session.mostRepsInSet = Math.max(session.mostRepsInSet, row.reps);
    session.totalReps += row.reps;
  }
  return [...sessions.values()];
}

function loadTypeOf(exerciseId: number): "weighted" | "bodyweight" | null {
  return db.select({ loadType: exercises.loadType }).from(exercises).where(eq(exercises.id, exerciseId)).get()?.loadType ?? null;
}

/**
 * The Records a finished Workout set, by its Workout exercise id: the pill names for each exercise that beat the
 * best of all earlier finished Workouts of that exercise. The first Workout of an exercise sets a silent baseline.
 * An unknown id or a Workout in progress returns nothing. Nothing is stored.
 */
export function workoutRecordTags(workoutId: number): WorkoutRecordTags {
  const workout = db
    .select({ id: workouts.id })
    .from(workouts)
    .where(and(eq(workouts.id, workoutId), eq(workouts.inProgress, false)))
    .get();
  if (!workout) return {};

  const exerciseIds = db
    .selectDistinct({ exerciseId: workoutExercises.exerciseId })
    .from(workoutExercises)
    .where(eq(workoutExercises.workoutId, workoutId))
    .all()
    .map((r) => r.exerciseId);
  if (exerciseIds.length === 0) return {};

  const loadTypes = new Map(
    db
      .select({ id: exercises.id, loadType: exercises.loadType })
      .from(exercises)
      .where(inArray(exercises.id, exerciseIds))
      .all()
      .map((e) => [e.id, e.loadType]),
  );

  const result: WorkoutRecordTags = {};
  for (const exerciseId of exerciseIds) {
    const sessions = sessionsOf(exerciseId, loadTypes.get(exerciseId) === "bodyweight" ? "bodyweight" : "weighted");
    const index = sessions.findIndex((s) => s.workoutId === workoutId);
    // No counted set in this Workout, or nothing earlier to beat.
    if (index <= 0) continue;
    const current = sessions[index];
    const earlier = sessions.slice(0, index);
    const tags =
      loadTypes.get(exerciseId) === "bodyweight" ? bodyweightTags(current, earlier) : weightedTags(current, earlier);
    if (tags.length > 0) result[current.workoutExerciseId] = tags;
  }
  return result;
}

function weightedTags(current: Session, earlier: Session[]): RecordName[] {
  const tags: RecordName[] = [];
  const bestHeaviest = earlier.reduce<CountedSet | null>(
    (best, s) => (s.heaviest && (!best || heavierThan(s.heaviest, best)) ? s.heaviest : best),
    null,
  );
  if (current.heaviest && (!bestHeaviest || heavierThan(current.heaviest, bestHeaviest))) tags.push("Heaviest set");

  const bestOneRepMax = Math.max(-Infinity, ...earlier.map((s) => s.oneRepMaxKg ?? -Infinity));
  if (current.oneRepMaxKg !== null && isMore(current.oneRepMaxKg, bestOneRepMax)) tags.push("1-rep max");

  const bestVolume = Math.max(0, ...earlier.map((s) => s.volumeKg));
  if (isMore(current.volumeKg, bestVolume)) tags.push("Most volume");
  return tags;
}

function bodyweightTags(current: Session, earlier: Session[]): RecordName[] {
  const tags: RecordName[] = [];
  if (current.mostRepsInSet > Math.max(0, ...earlier.map((s) => s.mostRepsInSet))) tags.push("Most reps in a set");
  if (current.totalReps > Math.max(0, ...earlier.map((s) => s.totalReps))) tags.push("Most reps in a workout");
  return tags;
}

/**
 * The current best of each Record of an exercise with the date of the Workout that set it, or null when no set counts.
 * A tied best stays with the earliest Workout. The 1-rep max and volume are whole numbers in `unit`.
 */
export function exerciseRecords(exerciseId: number, unit: Unit): ExerciseRecords | null {
  const loadType = loadTypeOf(exerciseId);
  if (!loadType) return null;
  const sessions = sessionsOf(exerciseId, loadType);
  if (sessions.length === 0) return null;

  if (loadType === "bodyweight") {
    let inSet = sessions[0];
    let inWorkout = sessions[0];
    for (const s of sessions) {
      if (s.mostRepsInSet > inSet.mostRepsInSet) inSet = s;
      if (s.totalReps > inWorkout.totalReps) inWorkout = s;
    }
    return {
      loadType,
      mostRepsInSet: { value: inSet.mostRepsInSet, date: inSet.date },
      mostRepsInWorkout: { value: inWorkout.totalReps, date: inWorkout.date },
    };
  }

  let heaviest: Session | null = null;
  let oneRepMax: Session | null = null;
  let volume: Session | null = null;
  for (const s of sessions) {
    if (s.heaviest && (!heaviest || !heaviest.heaviest || heavierThan(s.heaviest, heaviest.heaviest))) heaviest = s;
    if (s.oneRepMaxKg !== null && (!oneRepMax || isMore(s.oneRepMaxKg, oneRepMax.oneRepMaxKg ?? -Infinity))) oneRepMax = s;
    if (!volume || isMore(s.volumeKg, volume.volumeKg)) volume = s;
  }
  if (!heaviest?.heaviest || !volume) return null;
  const top = heaviest.heaviest;
  return {
    loadType,
    heaviestSet: {
      text: `${loggedWeightText({ value: top.weight, unit: top.unit }, unit)} × ${top.reps}`,
      date: heaviest.date,
    },
    estimatedOneRepMax:
      oneRepMax?.oneRepMaxKg == null ? null : { value: Math.round(fromKg(oneRepMax.oneRepMaxKg, unit)), date: oneRepMax.date },
    mostVolume: { value: Math.round(fromKg(volume.volumeKg, unit)), date: volume.date },
  };
}
