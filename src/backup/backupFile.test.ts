import {
  backupCounts,
  backupFileName,
  buildBackup,
  parseBackup,
  type BackupSource,
} from "./backupFile";

const RULE = { v: 1, step: "weight", repStep: 1, sessionsToEarn: 3 } as never;

function source(): BackupSource {
  return {
    exercises: [
      { id: 1, slug: "bench-press", name: "Bench press", muscles: ["chest"], equipment: "barbell", instructions: ["Lie down"], loadType: "weighted", isCustom: false },
      { id: 2, slug: "squat", name: "Squat", muscles: ["quads"], equipment: "barbell", instructions: [], loadType: "weighted", isCustom: false },
      { id: 900, slug: null, name: "Cable twist", muscles: ["abs"], equipment: "cable", instructions: ["Twist"], loadType: "weighted", isCustom: true },
    ],
    routines: [{ id: 10, name: "Push", days: 5, position: 0 }],
    routineExercises: [
      { id: 100, routineId: 10, exerciseId: 1, position: 0, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: RULE, stepKg: null, stepLb: 5 },
      { id: 101, routineId: 10, exerciseId: 900, position: 1, sets: 3, repMin: 8, repMax: 10, restS: 90, rule: RULE, stepKg: 2.5, stepLb: null },
    ],
    workouts: [
      { id: 50, routineId: 10, startedAt: 1000, finishedAt: 2000, date: "2026-11-01", feeling: 3, notes: "good", inProgress: false, lastEditedAt: 1500 },
      { id: 51, routineId: null, startedAt: 3000, finishedAt: null, date: "2026-11-02", feeling: null, notes: null, inProgress: true, lastEditedAt: null },
    ],
    workoutExercises: [
      { id: 500, workoutId: 50, exerciseId: 1, position: 0, targetWeightKg: 62.5, targetReps: 8, targetUnit: "kg", progressAccepted: true, acceptedTargetWeightKg: 65, acceptedTargetReps: 8, acceptedTargetUnit: "lb", isDeload: false },
      { id: 501, workoutId: 51, exerciseId: 2, position: 0, targetWeightKg: null, targetReps: null, targetUnit: null, progressAccepted: false, acceptedTargetWeightKg: null, acceptedTargetReps: null, acceptedTargetUnit: null, isDeload: false },
    ],
    sets: [
      { id: 1000, workoutExerciseId: 500, exerciseId: 1, idx: 0, weight: 60, weightUnit: "kg", reps: 8, done: true, isWarmup: false, edited: true },
      { id: 1001, workoutExerciseId: 500, exerciseId: 1, idx: 1, weight: 135, weightUnit: "lb", reps: 8, done: true, isWarmup: false, edited: false },
      { id: 1002, workoutExerciseId: 500, exerciseId: 1, idx: 2, weight: 45, weightUnit: "lb", reps: 10, done: true, isWarmup: true, edited: false },
      { id: 1003, workoutExerciseId: 501, exerciseId: 2, idx: 0, weight: 100, weightUnit: "kg", reps: 5, done: false, isWarmup: false, edited: false },
    ],
    userSettings: { id: 1, unit: "lb", defaultRestS: 120, showPreviousSet: false, keepScreenAwake: true, remindersOn: true, reminderTimeMin: 420 },
  };
}

const OPTIONS = { exportedAt: 1_700_000_000_000, appVersion: "1.0.0" };

function parsed(text: string) {
  const r = parseBackup(text);
  if (!r.ok) throw new Error(`refused: ${r.reason}`);
  return r;
}

describe("buildBackup", () => {
  it("writes a format version of 1 and the app details", () => {
    const file = JSON.parse(buildBackup(source(), OPTIONS));
    expect(file.format_version).toBe(1);
    expect(file.exported_at).toBe(1_700_000_000_000);
    expect(file.app_version).toBe("1.0.0");
  });

  it("leaves out a Workout in progress with its exercises and sets", () => {
    const { data } = parsed(buildBackup(source(), OPTIONS));
    expect(data.workouts.map((w) => w.id)).toEqual([50]);
    expect(data.workoutExercises.map((w) => w.id)).toEqual([500]);
    expect(data.sets.map((s) => s.id)).toEqual([1000, 1001, 1002]);
  });

  it("never holds entitlements, the Last backup date, or a stored record", () => {
    const text = buildBackup(source(), OPTIONS);
    for (const word of ["entitlement", "is_pro", "proof", "unlock_screen_owed", "last_backup", "in_progress", "record"]) {
      expect(text).not.toContain(word);
    }
  });

  it("carries Custom exercises in full and library exercises by slug only", () => {
    const { data } = parsed(buildBackup(source(), OPTIONS));
    expect(data.customExercises).toEqual([source().exercises[2]]);
    expect(data.libraryExercises).toEqual([{ id: 1, slug: "bench-press" }]);
  });
});

describe("parseBackup round trip", () => {
  it("gives the same rows back, a kg set and a lb set keeping their units", () => {
    const src = source();
    const { data } = parsed(buildBackup(src, OPTIONS));
    expect(data.routines).toEqual(src.routines);
    expect(data.routineExercises).toEqual(src.routineExercises);
    const { inProgress: _inProgress, ...finishedWorkout } = src.workouts[0];
    expect(data.workouts).toEqual([finishedWorkout]);
    expect(data.workoutExercises).toEqual([src.workoutExercises[0]]);
    expect(data.sets).toEqual(src.sets.slice(0, 3));
    expect(data.sets[0]).toMatchObject({ weight: 60, weightUnit: "kg" });
    expect(data.sets[1]).toMatchObject({ weight: 135, weightUnit: "lb" });
    expect(data.userSettings).toEqual({ unit: "lb", defaultRestS: 120, showPreviousSet: false, keepScreenAwake: true, remindersOn: true, reminderTimeMin: 420 });
  });

  it("reports the version, time and app version", () => {
    const r = parsed(buildBackup(source(), OPTIONS));
    expect(r).toMatchObject({ formatVersion: 1, exportedAt: 1_700_000_000_000, appVersion: "1.0.0" });
  });

  it("round-trips an empty phone", () => {
    const empty: BackupSource = { exercises: [], routines: [], routineExercises: [], workouts: [], workoutExercises: [], sets: [], userSettings: null };
    const { data } = parsed(buildBackup(empty, OPTIONS));
    expect(data.workouts).toEqual([]);
    expect(data.userSettings).toBeNull();
  });
});

describe("parseBackup refusals", () => {
  const good = () => JSON.parse(buildBackup(source(), OPTIONS));

  it("refuses a newer format version", () => {
    const r = parseBackup(JSON.stringify({ ...good(), format_version: 2 }));
    expect(r).toEqual({ ok: false, reason: "newer_version", message: "This backup is from a newer Increment. Update the app to restore it." });
  });

  it("refuses text and JSON that are not a backup", () => {
    for (const text of ["hello", "", "[1,2]", "42", "null", JSON.stringify({ routines: [] }), JSON.stringify({ ...good(), format_version: "1" }), JSON.stringify({ ...good(), format_version: 0 })]) {
      const r = parseBackup(text);
      expect(r).toMatchObject({ ok: false, reason: "not_backup", message: "This file isn't a valid Increment backup." });
    }
  });

  it("refuses a cut-off file", () => {
    const text = buildBackup(source(), OPTIONS);
    const r = parseBackup(text.slice(0, text.length - 40));
    expect(r).toMatchObject({ ok: false, reason: "cut_off" });
  });

  it("refuses a file with a missing table or a bad column", () => {
    const { sets: _sets, ...withoutSets } = good();
    expect(parseBackup(JSON.stringify(withoutSets))).toMatchObject({ ok: false, reason: "not_backup" });
    const bad = good();
    bad.sets[0].weight_unit = "stone";
    expect(parseBackup(JSON.stringify(bad))).toMatchObject({ ok: false, reason: "not_backup" });
  });

  it("refuses rows pointing at something missing, each with the same plain message", () => {
    const cases: ((f: ReturnType<typeof good>) => void)[] = [
      (f) => { f.sets[0].workout_exercise_id = 9999; },
      (f) => { f.sets[0].exercise_id = 9999; },
      (f) => { f.workout_exercises[0].workout_id = 9999; },
      (f) => { f.workouts[0].routine_id = 9999; },
      (f) => { f.routine_exercises[0].routine_id = 9999; },
      (f) => { f.routine_exercises[0].exercise_id = 9999; },
      (f) => { f.routines.push({ ...f.routines[0] }); },
    ];
    for (const mutate of cases) {
      const f = good();
      mutate(f);
      const r = parseBackup(JSON.stringify(f));
      expect(r).toMatchObject({ ok: false, reason: "broken_reference" });
    }
  });

  it("refuses values outside the app's own limits as not a backup", () => {
    const cases: ((f: ReturnType<typeof good>) => void)[] = [
      (f) => { f.routine_exercises[0].rule = { v: 1, kind: "double" }; },
      (f) => { f.routine_exercises[0].rule.repStep = 9; },
      (f) => { f.routines[0].days = 128; },
      (f) => { f.routines[0].days = -1; },
      (f) => { f.routine_exercises[0].sets = 0; },
      (f) => { f.routine_exercises[0].sets = 11; },
      (f) => { f.routine_exercises[0].rep_min = 11; f.routine_exercises[0].rep_max = 10; },
      (f) => { f.routine_exercises[0].rep_max = 31; },
      (f) => { f.routine_exercises[0].rest_s = 0; },
      (f) => { f.routine_exercises[0].rest_s = 601; },
      (f) => { f.workouts[0].feeling = 9; },
      (f) => { f.workouts[0].date = "1 Nov 2026"; },
      (f) => { f.workouts[0].date = "2026-13-40"; },
      (f) => { f.sets[0].weight = -5; },
      (f) => { f.sets[0].reps = -1; },
      (f) => { f.workout_exercises[0].target_weight_kg = -1; },
      (f) => { f.user_settings.default_rest_s = -1; },
      (f) => { f.user_settings.reminder_time_min = 1440; },
    ];
    for (const mutate of cases) {
      const f = good();
      mutate(f);
      expect(parseBackup(JSON.stringify(f))).toMatchObject({ ok: false, reason: "not_backup", message: "This file isn't a valid Increment backup." });
    }
  });

  it("refuses a repeated exercise in a routine or a workout position as a broken reference", () => {
    const dupRoutine = good();
    dupRoutine.routine_exercises[1].exercise_id = dupRoutine.routine_exercises[0].exercise_id;
    expect(parseBackup(JSON.stringify(dupRoutine))).toMatchObject({ ok: false, reason: "broken_reference" });
    const dupWorkout = good();
    dupWorkout.workout_exercises.push({ ...dupWorkout.workout_exercises[0], id: 777 });
    expect(parseBackup(JSON.stringify(dupWorkout))).toMatchObject({ ok: false, reason: "broken_reference" });
  });

  it("gives each refusal its own message", () => {
    const f = good();
    const msgs = [
      parseBackup(JSON.stringify({ ...f, format_version: 9 })),
      parseBackup("nope"),
      parseBackup('{"format":'),
      parseBackup(JSON.stringify({ ...f, sets: [{ ...f.sets[0], workout_exercise_id: 7777 }] })),
    ].map((r) => (r.ok ? "" : r.message));
    expect(new Set(msgs).size).toBe(4);
  });
});

describe("parseBackup ignores Pro claims", () => {
  it("drops a hand-edited entitlement, is_pro and in-progress flag", () => {
    const f = JSON.parse(buildBackup(source(), OPTIONS));
    f.entitlements = { is_pro: true };
    f.is_pro = true;
    f.user_settings.is_pro = true;
    f.workouts[0].in_progress = true;
    const r = parsed(JSON.stringify(f));
    expect(JSON.stringify(r.data)).not.toMatch(/is_?pro|entitlement/i);
    expect(r.data).not.toHaveProperty("entitlements");
    expect(r.data.workouts[0]).not.toHaveProperty("inProgress");
  });
});

describe("backupCounts", () => {
  it("counts routines, Custom exercises, finished Workouts and done working sets", () => {
    const { data } = parsed(buildBackup(source(), OPTIONS));
    expect(backupCounts(data)).toEqual({ routines: 1, customExercises: 1, workouts: 1, sets: 2 });
  });
});

describe("backupFileName", () => {
  it("is the date in the file name", () => {
    expect(backupFileName(new Date(2026, 10, 14))).toBe("Increment backup 14 Nov 2026.increment");
  });
});
