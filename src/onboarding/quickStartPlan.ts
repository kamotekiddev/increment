import type { Unit } from "@/units";

/**
 * TEMPORARY (Phase 4 feature 1): the hard-coded Starter plan. It is replaced by the plan generator in feature 3,
 * which must return exactly this plan for the Quick start defaults (Stay fit and healthy, Just starting, 3 days
 * Mon/Wed/Fri, Full gym); a test there pins that. Replace this one constant, nothing else knows the plan.
 *
 * Full body A on Mon and Fri (the first and third day), Full body B on Wed. 4 library exercises each (Just starting),
 * 3 sets, Rep range 10 to 15, rest 1:00 (Stay fit and healthy). Exercises are named from the seeded library (Full gym).
 */
export interface QuickStartRoutine {
  name: string;
  /** Days bitmask, Monday = bit 0 (see `routineDays`). */
  days: number;
  /** Library exercise names, in order. */
  exercises: string[];
}

const MON = 1 << 0;
const WED = 1 << 2;
const FRI = 1 << 4;

export const QUICK_START_SETUP = { sets: 3, repMin: 10, repMax: 15, restS: 60 } as const;

/** The Starter plan for the Quick start defaults (the constant keeps the Quick start name; the concept is the Starter plan). */
export const QUICK_START_PLAN: readonly QuickStartRoutine[] = [
  {
    name: "Full body A",
    days: MON | FRI,
    exercises: ["Barbell Squat", "Barbell Bench Press - Medium Grip", "Bent Over Barbell Row", "Barbell Shoulder Press"],
  },
  {
    name: "Full body B",
    days: WED,
    exercises: ["Romanian Deadlift", "Dumbbell Bench Press", "Wide-Grip Lat Pulldown", "Leg Press"],
  },
];

/** The kg / lb choice Quick start starts on. */
export const QUICK_START_DEFAULT_UNIT: Unit = "kg";
