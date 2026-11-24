import { sql } from "drizzle-orm";
import type { OverloadRule } from "../engine/types";
import { index, integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

/**
 * A set stores the number the lifter typed and the unit they typed it in (ADR 0003): `weight` + `weight_unit`.
 * Targets are kg (full-precision REAL); a routine exercise's Jump is saved per unit, each in its own unit.
 * Conversion happens in memory only, in `src/units`.
 */

export const exercises = sqliteTable("exercises", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  /** Stable id from the library seed; null for custom exercises. */
  slug: text("slug").unique(),
  name: text("name").notNull(),
  /** JSON array of muscle names. */
  muscles: text("muscles", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  equipment: text("equipment").notNull(),
  /** JSON array of how-to steps. */
  instructions: text("instructions", { mode: "json" }).$type<string[]>().notNull().default(sql`'[]'`),
  loadType: text("load_type", { enum: ["weighted", "bodyweight"] }).notNull(),
  isCustom: integer("is_custom", { mode: "boolean" }).notNull().default(false),
});

export const routines = sqliteTable("routines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  /** Bitmask of training days, Monday = bit 0. */
  days: integer("days").notNull().default(0),
  position: integer("position").notNull().default(0),
});

export const routineExercises = sqliteTable(
  "routine_exercises",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    routineId: integer("routine_id").notNull().references(() => routines.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
    position: integer("position").notNull(),
    sets: integer("sets").notNull(),
    repMin: integer("rep_min").notNull(),
    repMax: integer("rep_max").notNull(),
    restS: integer("rest_s").notNull(),
    /** OverloadRule JSON (see src/engine/types.ts); carries its own `v`. */
    rule: text("rule", { mode: "json" }).$type<OverloadRule>().notNull(),
    /**
     * The Jump ("Add each time"), one per unit, each in its own unit: `step_kg` in kg (2.5), `step_lb` in lb (5),
     * never converted. NULL until the lifter sets that unit's Jump: an empty one is 2.5 kg / 5 lb (`jumpIn`).
     * The engine steps by the one for the lifter's current unit; switching unit never writes either.
     */
    stepKg: real("step_kg"),
    stepLb: real("step_lb"),
  },
  (t) => [
    index("routine_exercises_routine_idx").on(t.routineId, t.position),
    uniqueIndex("routine_exercises_routine_exercise_uniq").on(t.routineId, t.exerciseId),
  ],
);

export const workouts = sqliteTable(
  "workouts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    /** Null for a workout started without a routine. Deleting the routine deletes its workouts (ADR 0002). */
    routineId: integer("routine_id").references(() => routines.id, { onDelete: "cascade" }),
    startedAt: integer("started_at").notNull(),
    finishedAt: integer("finished_at"),
    /** Local calendar date, YYYY-MM-DD, used for streaks and deload weeks. */
    date: text("date").notNull(),
    feeling: integer("feeling"),
    notes: text("notes"),
    inProgress: integer("in_progress", { mode: "boolean" }).notNull().default(true),
    /** When the lifter last changed a set (ms). Null until the first change; crash resume falls back to started_at. */
    lastEditedAt: integer("last_edited_at"),
  },
  (t) => [index("workouts_date_idx").on(t.date)],
);

/** One exercise within one workout: the Target shown, and what the lifter decided. */
export const workoutExercises = sqliteTable(
  "workout_exercises",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    workoutId: integer("workout_id").notNull().references(() => workouts.id, { onDelete: "cascade" }),
    exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
    position: integer("position").notNull(),
    /** The Target shown at the start; null when none existed (first workout). */
    targetWeightKg: real("target_weight_kg"),
    targetReps: integer("target_reps"),
    /**
     * The lifter's unit when Start set the Target. The next Target snaps to the Jump's grid only when the unit
     * differs. Null on rows saved before it was stored: those fall back to their sets' weight_unit, then kg.
     */
    targetUnit: text("target_unit", { enum: ["kg", "lb"] }),
    /** The lifter accepted the offered step after this workout. */
    progressAccepted: integer("progress_accepted", { mode: "boolean" }).notNull().default(false),
    /**
     * The stepped-up Target the lifter accepted (Go up), kept so the next Start shows it even if a Jump changes.
     * Null after Stay, and on accepted rows saved before it was stored (those recompute the step).
     */
    acceptedTargetWeightKg: real("accepted_target_weight_kg"),
    acceptedTargetReps: integer("accepted_target_reps"),
    /**
     * The lifter's unit when they tapped Go up, which the accepted Target was offered in. Null after Stay and on
     * rows saved before it was stored: those use target_unit's fallbacks.
     */
    acceptedTargetUnit: text("accepted_target_unit", { enum: ["kg", "lb"] }),
    isDeload: integer("is_deload", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [uniqueIndex("workout_exercises_unique").on(t.workoutId, t.exerciseId, t.position)],
);

export const sets = sqliteTable(
  "sets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    workoutExerciseId: integer("workout_exercise_id")
      .notNull()
      .references(() => workoutExercises.id, { onDelete: "cascade" }),
    /** Denormalised so records can be queried per exercise without a join. */
    exerciseId: integer("exercise_id").notNull().references(() => exercises.id),
    idx: integer("idx").notNull(),
    /** The number as typed (135 for 135 lb), never converted or rounded on save. A blank weight is 0 until typed. */
    weight: real("weight").notNull(),
    /** The unit `weight` was typed in. Switching the display unit never changes it. */
    weightUnit: text("weight_unit", { enum: ["kg", "lb"] }).notNull(),
    reps: integer("reps").notNull(),
    done: integer("done", { mode: "boolean" }).notNull().default(false),
    isWarmup: integer("is_warmup", { mode: "boolean" }).notNull().default(false),
    /** The lifter typed or nudged this row, so it stops following earlier rows. Only meaningful while the workout is in progress. */
    edited: integer("edited", { mode: "boolean" }).notNull().default(false),
  },
  (t) => [index("sets_exercise_idx").on(t.exerciseId), index("sets_workout_exercise_idx").on(t.workoutExerciseId)],
);

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  /** JSON-encoded value. */
  value: text("value", { mode: "json" }).notNull(),
});

/**
 * The lifter's preferences, one row (id 1), created on first read. Later features add their columns here.
 * Separate from the key/value `settings` table above, which only holds internal flags such as the seed version.
 */
export const userSettings = sqliteTable("user_settings", {
  id: integer("id").primaryKey(),
  /** The unit every weight is shown and typed in. A display preference only: switching it never writes a set. */
  unit: text("unit", { enum: ["kg", "lb"] }).notNull().default("kg"),
  /** Default rest: the Rest length (seconds) an exercise gets when added to a Routine. Read through the rest clamp. */
  defaultRestS: integer("default_rest_s").notNull().default(90),
  /** Show previous set: whether the live workout draws the Last column. */
  showPreviousSet: integer("show_previous_set", { mode: "boolean" }).notNull().default(true),
  /** Keep screen awake: whether the live workout holds the screen lit. */
  keepScreenAwake: integer("keep_screen_awake", { mode: "boolean" }).notNull().default(true),
  /** Training day reminders: whether the app schedules a local notification on each Routine day. */
  remindersOn: integer("reminders_on", { mode: "boolean" }).notNull().default(false),
  /** Reminder time as minutes after local midnight (1080 = 6:00 PM). Read through a 0 to 1439 clamp. */
  reminderTimeMin: integer("reminder_time_min").notNull().default(1080),
});

/**
 * Single-row cache of the Pro purchase, so screens draw at once and Pro works offline (ADR 0004).
 * The phone's store decides Pro: each definite answer is written here ("owned" sets `is_pro`, "not owned"
 * clears it, undoing a refund or a hand edit), and the row is only the fallback when the store can't answer.
 * `proof` keeps the store's signed transaction (iOS) or purchase token (Android) as a record; nothing
 * verifies its signature. `verified_at` is when the store last answered, in ms. Written with an upsert on id 1.
 */
export const entitlements = sqliteTable("entitlements", {
  id: integer("id").primaryKey(),
  isPro: integer("is_pro", { mode: "boolean" }).notNull().default(false),
  productId: text("product_id"),
  proof: text("proof"),
  verifiedAt: integer("verified_at"),
  /** Pro switched on during a live workout, so Pro unlocked still has to show once that workout is over. */
  unlockScreenOwed: integer("unlock_screen_owed", { mode: "boolean" }).notNull().default(false),
});
