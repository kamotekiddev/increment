import { and, eq, isNotNull } from "drizzle-orm";

import type { Db, SelectInsertDb } from "@/db/client";
import { exercises, userSettings } from "@/db/schema";
import { defaultRule } from "@/engine";
import { insertRoutine, insertRoutineExercise } from "@/routines/routineInsert";
import { writeUnit } from "@/settings/unitSetting";
import type { Unit } from "@/units";

import { QUICK_START_PLAN, QUICK_START_SETUP } from "./quickStartPlan";

/** The one onboarding module: whether onboarding is done and how it finishes. Nothing is written before a finish call. */

const ROW_ID = 1;

export type StartRoute = "welcome" | "tabs";

/** Pure: Welcome until onboarding is done, then the tabs. */
export function startRoute(onboarded: boolean): StartRoute {
  return onboarded ? "tabs" : "welcome";
}

/** Whether onboarding is done. A pure read: never creates the settings row. */
export function isOnboarded(q: Pick<Db, "select">): boolean {
  return q.select({ onboarded: userSettings.onboarded }).from(userSettings).get()?.onboarded ?? false;
}

function markOnboarded(q: SelectInsertDb): void {
  q.insert(userSettings)
    .values({ id: ROW_ID, onboarded: true })
    .onConflictDoUpdate({ target: userSettings.id, set: { onboarded: true } })
    .run();
}

/** Sets the flag only (Restore from Welcome, Welcome back's Done). */
export function finishOnboarding(db: Db): void {
  markOnboarded(db);
}

/**
 * Creates the Starter plan, saves the unit and sets the flag in one all-or-nothing transaction. Any failure
 * (a library exercise missing, a write error) rolls everything back and rethrows.
 */
export function finishQuickStart(db: Db, unit: Unit): void {
  db.transaction((tx) => {
    for (const routine of QUICK_START_PLAN) {
      const routineId = insertRoutine(tx, routine.name, routine.days);
      for (const name of routine.exercises) {
        const found = tx
          .select({ id: exercises.id, loadType: exercises.loadType })
          .from(exercises)
          .where(and(eq(exercises.name, name), eq(exercises.isCustom, false), isNotNull(exercises.slug)))
          .get();
        if (!found) throw new Error(`Quick start exercise "${name}" is not in the library.`);
        insertRoutineExercise(tx, routineId, found.id, { ...QUICK_START_SETUP }, {}, defaultRule(found.loadType));
      }
    }
    writeUnit(tx, unit);
    markOnboarded(tx);
  });
}
