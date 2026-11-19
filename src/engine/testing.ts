import { defaultRule } from "./rule";
import type { HistorySession, NextTargetInput, OverloadRule, Planned, WeightUnit } from "./types";

export const planned: Planned = { sets: 3, repMin: 8, repMax: 10 };

/** A workout with the given reps per working set, all at `weightKg`. */
export function session(
  date: string,
  target: { weightKg: number; reps: number } | null,
  reps: number[],
  opts: { weightKg?: number; accepted?: boolean; deload?: boolean; unit?: WeightUnit } = {},
): HistorySession {
  const weightKg = opts.weightKg ?? target?.weightKg ?? 60;
  return {
    date,
    target,
    progressAccepted: opts.accepted ?? false,
    isDeload: opts.deload ?? false,
    ...(opts.unit ? { targetUnit: opts.unit } : {}),
    sets: reps.map((r) => ({ weightKg, reps: r, done: true, isWarmup: false })),
  };
}

export function input(
  history: HistorySession[],
  rule: Partial<OverloadRule> = {},
  overrides: Partial<NextTargetInput> = {},
): NextTargetInput {
  return {
    rule: { ...defaultRule("weighted"), ...rule },
    planned,
    loadType: "weighted",
    history,
    jumpKg: 2.5,
    unit: "kg",
    ...overrides,
  };
}
