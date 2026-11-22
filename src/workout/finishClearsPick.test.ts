import type { Db } from "@/db/client";
import { workouts } from "@/db/schema";
import { pickStore } from "@/progress/pickStore";

import { discardWorkout, finishWorkout } from "./workoutQueries";

jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

function openWorkout(): number {
  return db.insert(workouts).values({ routineId: null, startedAt: 1, date: "2026-11-20", inProgress: true }).returning().get().id;
}

describe("the remembered Progress pick", () => {
  beforeEach(() => pickStore.getState().clear());

  it("is cleared when a workout is finished", () => {
    pickStore.getState().pick(3);
    finishWorkout(openWorkout(), new Date(2026, 10, 20, 1));
    expect(pickStore.getState().exerciseId).toBeNull();
  });

  it("is kept when a workout is discarded", () => {
    pickStore.getState().pick(3);
    discardWorkout(openWorkout());
    expect(pickStore.getState().exerciseId).toBe(3);
  });
});
