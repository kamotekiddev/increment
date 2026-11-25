import { KG_PER_LB } from "../units";
import { createDbAtMigration } from "../../test-support/migrationDb";

/** Migration 0009: sets go from kg + entered_unit to the number as typed + its unit (ADR 0003). */
describe("migration 0009: sets store the weight as typed", () => {
  function legacyDb(unitSetting: "kg" | "lb" | null) {
    const { sqlite, migrateTo } = createDbAtMigration(8);
    if (unitSetting) sqlite.prepare("INSERT INTO user_settings (id, unit) VALUES (1, ?)").run(unitSetting);
    sqlite.prepare("INSERT INTO exercises (id, name, equipment, load_type) VALUES (1, 'Bench press', 'barbell', 'weighted')").run();
    sqlite.prepare("INSERT INTO workouts (id, started_at, date, in_progress) VALUES (1, 1, '2026-11-01', 0)").run();
    sqlite.prepare("INSERT INTO workouts (id, started_at, date, in_progress) VALUES (2, 2, '2026-11-21', 1)").run();
    sqlite.prepare("INSERT INTO workout_exercises (id, workout_id, exercise_id, position) VALUES (1, 1, 1, 0)").run();
    sqlite.prepare("INSERT INTO workout_exercises (id, workout_id, exercise_id, position) VALUES (2, 2, 1, 0)").run();
    const insert = sqlite.prepare(
      "INSERT INTO sets (id, workout_exercise_id, exercise_id, idx, weight_kg, entered_unit, reps, done) VALUES (?, ?, 1, ?, ?, ?, 8, ?)",
    );
    return { sqlite, migrateTo, insert };
  }
  const read = (sqlite: ReturnType<typeof legacyDb>["sqlite"]) =>
    sqlite.prepare("SELECT id, weight, weight_unit AS unit FROM sets ORDER BY id").all() as { id: number; weight: number; unit: string }[];

  it("with the preference at lb, every set logged in lb gets unit lb and its typed value back", () => {
    const { sqlite, migrateTo, insert } = legacyDb("lb");
    // How the old app stored 135, 225 and 137.5 lb: kg at full precision, entered_unit lb.
    [135, 225, 137.5].forEach((lb, i) => insert.run(i + 1, 1, i, lb * KG_PER_LB, "lb", 1));
    migrateTo(9);
    expect(read(sqlite)).toEqual([
      { id: 1, weight: 135, unit: "lb" },
      { id: 2, weight: 225, unit: "lb" },
      { id: 3, weight: 137.5, unit: "lb" },
    ]);
  });

  it("keeps each logged set's own unit, whatever the preference: a kg set stays kg, unchanged", () => {
    const { sqlite, migrateTo, insert } = legacyDb("lb");
    insert.run(1, 1, 0, 61.25, "kg", 1);
    insert.run(2, 1, 1, 100, "kg", 1);
    migrateTo(9);
    expect(read(sqlite)).toEqual([
      { id: 1, weight: 61.25, unit: "kg" },
      { id: 2, weight: 100, unit: "kg" },
    ]);
  });

  it("gives an open set of a workout in progress the preferred unit: its kg placeholder was never typed", () => {
    const { sqlite, migrateTo, insert } = legacyDb("lb");
    // Pre-filled from a 140 lb Target (stored as kg, placeholder entered_unit kg), and a blank row.
    insert.run(1, 2, 0, 140 * KG_PER_LB, "kg", 0);
    insert.run(2, 2, 1, 0, "kg", 0);
    migrateTo(9);
    expect(read(sqlite)).toEqual([
      { id: 1, weight: 140, unit: "lb" },
      { id: 2, weight: 0, unit: "lb" },
    ]);
  });

  it("falls back to kg for open sets when there is no settings row", () => {
    const { sqlite, migrateTo, insert } = legacyDb(null);
    insert.run(1, 2, 0, 60, "kg", 0);
    migrateTo(9);
    expect(read(sqlite)).toEqual([{ id: 1, weight: 60, unit: "kg" }]);
  });

  it("leaves Targets in kg", () => {
    const { sqlite, migrateTo } = legacyDb("lb");
    sqlite.prepare("UPDATE workout_exercises SET target_weight_kg = ?, target_unit = 'lb' WHERE id = 1").run(140 * KG_PER_LB);
    migrateTo(9);
    expect(sqlite.prepare("SELECT target_weight_kg AS kg FROM workout_exercises WHERE id = 1").get()).toEqual({ kg: 140 * KG_PER_LB });
  });
});

/** Migration 0010: a step per routine exercise (kg and lb), and the per-equipment Jumps dropped without copying. */
describe("migration 0010: a step per routine exercise", () => {
  const rule = {
    v: 1,
    step: "both",
    repStep: 2,
    sessionsToEarn: 2,
    miss: { after: 2, action: { kind: "drop", percent: 10 } },
    deload: { everyWeeks: 6, percent: 20 },
  };
  const curlRule = { v: 1, step: "weight", repStep: 1, sessionsToEarn: 3 };

  function migratedDb() {
    const { sqlite, migrateTo } = createDbAtMigration(9);
    // A lifter who changed every Jump, in lb, with the Workout settings off their defaults.
    sqlite
      .prepare(
        `INSERT INTO user_settings (id, unit, jump_barbell_kg, jump_dumbbell_kg, jump_machine_kg, jump_cable_kg, jump_bodyweight_kg,
          default_rest_s, show_previous_set, keep_screen_awake) VALUES (1, 'lb', 5, 1, 10, 1.25, 0.5, 120, 0, 0)`,
      )
      .run();
    sqlite.prepare("INSERT INTO exercises (id, name, equipment, load_type) VALUES (1, 'Bench press', 'barbell', 'weighted')").run();
    sqlite.prepare("INSERT INTO exercises (id, name, equipment, load_type) VALUES (2, 'Dumbbell curl', 'dumbbell', 'weighted')").run();
    sqlite.prepare("INSERT INTO routines (id, name, days, position) VALUES (1, 'Push', 5, 0)").run();
    const insert = sqlite.prepare(
      "INSERT INTO routine_exercises (id, routine_id, exercise_id, position, sets, rep_min, rep_max, rest_s, rule) VALUES (?, 1, ?, ?, ?, ?, ?, ?, ?)",
    );
    insert.run(1, 1, 0, 3, 8, 10, 120, JSON.stringify(rule));
    insert.run(2, 2, 1, 4, 10, 12, 60, JSON.stringify(curlRule));
    migrateTo(10);
    return sqlite;
  }

  it("keeps every routine exercise and its rule as it was", () => {
    const sqlite = migratedDb();
    const rows = sqlite
      .prepare("SELECT id, routine_id, exercise_id, position, sets, rep_min, rep_max, rest_s, rule FROM routine_exercises ORDER BY id")
      .all();
    expect(rows).toEqual([
      { id: 1, routine_id: 1, exercise_id: 1, position: 0, sets: 3, rep_min: 8, rep_max: 10, rest_s: 120, rule: JSON.stringify(rule) },
      { id: 2, routine_id: 1, exercise_id: 2, position: 1, sets: 4, rep_min: 10, rep_max: 12, rest_s: 60, rule: JSON.stringify(curlRule) },
    ]);
  });

  it("leaves both steps empty on every routine exercise, so each starts at 2.5 kg / 5 lb", () => {
    const sqlite = migratedDb();
    expect(sqlite.prepare("SELECT id, step_kg, step_lb FROM routine_exercises ORDER BY id").all()).toEqual([
      { id: 1, step_kg: null, step_lb: null },
      { id: 2, step_kg: null, step_lb: null },
    ]);
  });

  it("drops the Jump columns from the settings row and keeps the rest of it", () => {
    const sqlite = migratedDb();
    const columns = (sqlite.prepare("PRAGMA table_info(user_settings)").all() as { name: string }[]).map((c) => c.name);
    expect(columns.filter((c) => c.startsWith("jump_"))).toEqual([]);
    expect(sqlite.prepare("SELECT * FROM user_settings").all()).toEqual([
      { id: 1, unit: "lb", default_rest_s: 120, show_previous_set: 0, keep_screen_awake: 0 },
    ]);
  });
});

/** Migration 0012: the entitlements row remembers a Pro unlocked screen held back by a live workout. */
describe("migration 0012: Pro unlocked can be owed", () => {
  it("keeps a cached Pro row as it was and owes nothing", () => {
    const { sqlite, migrateTo } = createDbAtMigration(11);
    sqlite
      .prepare("INSERT INTO entitlements (id, is_pro, product_id, proof, verified_at) VALUES (1, 1, 'pro_lifetime', 'token', 1700)")
      .run();
    migrateTo(12);
    expect(sqlite.prepare("SELECT * FROM entitlements").all()).toEqual([
      { id: 1, is_pro: 1, product_id: "pro_lifetime", proof: "token", verified_at: 1700, unlock_screen_owed: 0 },
    ]);
  });

  it("gives a row written later the flag off by default", () => {
    const { sqlite, migrateTo } = createDbAtMigration(11);
    migrateTo(12);
    sqlite.prepare("INSERT INTO entitlements (id, is_pro) VALUES (1, 0)").run();
    expect(sqlite.prepare("SELECT unlock_screen_owed FROM entitlements").get()).toEqual({ unlock_screen_owed: 0 });
  });
});

/** Migration 0013: exercise references cascade on delete (ADR 0005), by table rebuild. */
describe("migration 0013: exercise references cascade", () => {
  function migratedDb() {
    const { sqlite, migrateTo } = createDbAtMigration(12);
    sqlite.prepare("INSERT INTO exercises (id, name, equipment, load_type) VALUES (1, 'Bench press', 'barbell', 'weighted')").run();
    sqlite.prepare("INSERT INTO exercises (id, name, equipment, load_type, is_custom) VALUES (2, 'Ring rows', 'bodyweight', 'bodyweight', 1)").run();
    sqlite.prepare("INSERT INTO routines (id, name, days, position) VALUES (1, 'Push', 5, 0)").run();
    sqlite.prepare("INSERT INTO routine_exercises (id, routine_id, exercise_id, position, sets, rep_min, rep_max, rest_s, rule, step_kg) VALUES (1, 1, 1, 0, 3, 8, 10, 90, '{}', 2)").run();
    sqlite.prepare("INSERT INTO routine_exercises (id, routine_id, exercise_id, position, sets, rep_min, rep_max, rest_s, rule) VALUES (2, 1, 2, 1, 3, 8, 10, 90, '{}')").run();
    sqlite.prepare("INSERT INTO workouts (id, started_at, date, in_progress) VALUES (1, 1, '2026-11-01', 0)").run();
    sqlite.prepare("INSERT INTO workout_exercises (id, workout_id, exercise_id, position, target_weight_kg, is_deload) VALUES (1, 1, 1, 0, 60, 1)").run();
    sqlite.prepare("INSERT INTO workout_exercises (id, workout_id, exercise_id, position) VALUES (2, 1, 2, 1)").run();
    sqlite.prepare("INSERT INTO sets (id, workout_exercise_id, exercise_id, idx, weight, weight_unit, reps, done) VALUES (1, 1, 1, 0, 60, 'kg', 8, 1)").run();
    sqlite.prepare("INSERT INTO sets (id, workout_exercise_id, exercise_id, idx, weight, weight_unit, reps, done) VALUES (2, 2, 2, 0, 0, 'kg', 8, 1)").run();
    migrateTo(13);
    return sqlite;
  }

  it("keeps every row of the three rebuilt tables", () => {
    const sqlite = migratedDb();
    const count = (t: string) => (sqlite.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n;
    expect([count("routine_exercises"), count("workout_exercises"), count("sets")]).toEqual([2, 2, 2]);
    expect(sqlite.prepare("SELECT step_kg FROM routine_exercises WHERE id = 1").get()).toEqual({ step_kg: 2 });
    expect(sqlite.prepare("SELECT target_weight_kg, is_deload FROM workout_exercises WHERE id = 1").get()).toEqual({ target_weight_kg: 60, is_deload: 1 });
    expect(sqlite.prepare("SELECT weight, reps, done FROM sets WHERE id = 1").get()).toEqual({ weight: 60, reps: 8, done: 1 });
  });

  it("keeps every index", () => {
    const sqlite = migratedDb();
    const indexes = (sqlite.prepare("SELECT name FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[]).map((i) => i.name);
    expect(indexes).toEqual(
      expect.arrayContaining([
        "routine_exercises_routine_idx",
        "routine_exercises_routine_exercise_uniq",
        "workout_exercises_unique",
        "sets_exercise_idx",
        "sets_workout_exercise_idx",
      ]),
    );
  });

  it("then deleting an exercise cascades to its rows only", () => {
    const sqlite = migratedDb();
    sqlite.pragma("foreign_keys = ON");
    sqlite.prepare("DELETE FROM exercises WHERE id = 2").run();
    expect(sqlite.prepare("SELECT exercise_id FROM routine_exercises").all()).toEqual([{ exercise_id: 1 }]);
    expect(sqlite.prepare("SELECT exercise_id FROM workout_exercises").all()).toEqual([{ exercise_id: 1 }]);
    expect(sqlite.prepare("SELECT exercise_id FROM sets").all()).toEqual([{ exercise_id: 1 }]);
    expect(sqlite.prepare("SELECT COUNT(*) AS n FROM workouts").get()).toEqual({ n: 1 });
  });
});
