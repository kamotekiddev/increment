/** Overload engine types. Weights are kg. No I/O, no React, no database. */

export type LoadType = "weighted" | "bodyweight";
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
  isDeload: boolean;
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
}
