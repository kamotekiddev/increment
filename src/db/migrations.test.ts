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
