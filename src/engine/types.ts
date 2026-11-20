/** Overload engine types. Weights are kg. No I/O, no React, no database. */

export type LoadType = "weighted" | "bodyweight";
/** The unit a weight was set or logged in. The engine never converts; it only compares units. */
export type WeightUnit = "kg" | "lb";
export type Step = "weight" | "reps" | "both";

export type MissAction = { kind: "keep" } | { kind: "drop"; percent: number };

/** Stored per exercise in a routine (routine_exercises.rule). `v` is the format version. */
export interface OverloadRule {
  v: 1;
  step: Step;
  /** Reps added per step when step is "reps" or "both". 1 to 3. */
  repStep: number;
  /** Clean workouts in a row at the same Target before progression is Earned. 1 to 5. */
  sessionsToEarn: number;
  /** What happens after `after` misses in a row at the same weight. Off when absent. */
  miss?: { after: number; action: MissAction };
  /** Every `everyWeeks` training weeks, one lighter workout. Off when absent. */
  deload?: { everyWeeks: number; percent: number };
}

export interface Planned {
  sets: number;
  repMin: number;
  repMax: number;
}

export interface Target {
  weightKg: number;
  reps: number;
}

export interface LoggedSet {
  weightKg: number;
  reps: number;
  done: boolean;
  isWarmup: boolean;
}

/** One past workout of one exercise. `sets` are in set order. */
export interface HistorySession {
  /** Local calendar date, YYYY-MM-DD. */
  date: string;
  /** The Target shown at the start. Null for a first workout with no Target. */
  target: Target | null;
  /** The lifter accepted the offered step after this workout. */
  progressAccepted: boolean;
  /** The stepped-up Target the lifter accepted, as offered (snapped to the Jump's grid only after a unit switch). Absent or null when not stored (Stay, or saved before it was kept); the step is then recomputed. */
  acceptedTarget?: Target | null;
  isDeload: boolean;
  /**
   * The unit the Target and accepted Target were set in or, for a first workout with no Target, the unit
   * its sets were logged in. Absent means kg. When it differs from the lifter's current unit, the Target
   * snaps to the Jump's grid.
   */
  targetUnit?: WeightUnit;
  /** The unit the accepted Target was offered in (the lifter's unit at Go up). Absent means `targetUnit`. */
  acceptedTargetUnit?: WeightUnit;
  sets: LoggedSet[];
}

export type Outcome = "clean" | "hold" | "miss" | "baseline" | "deload";

export type Reason =
  | "no-history"
  | "baseline"
  | "on-track"
  | "hold"
  | "miss"
  | "miss-keep"
  | "miss-drop"
  | "earned"
  | "progressed"
  | "at-top-of-range"
  | "deload";

export interface TargetResult {
  /** What to show for the next workout. Null when there is nothing to base one on. */
  target: Target | null;
  /** The stepped-up Target to offer once progression is Earned. */
  proposal: Target | null;
  reason: Reason;
}

export interface NextTargetInput {
  rule: OverloadRule;
  planned: Planned;
  loadType: LoadType;
  /** Newest first. */
  history: HistorySession[];
  /** The Jump, in kg. */
  jumpKg: number;
  /** The lifter's current unit, which `jumpKg` belongs to. */
  unit: WeightUnit;
}
