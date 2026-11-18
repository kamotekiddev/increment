import type { SelectInsertDb } from "@/db/client";
import { userSettings } from "@/db/schema";
import type { Unit } from "@/units";

/** The one settings row. */
const ROW_ID = 1;

/** The saved unit. Creates the settings row (kg) the first time it is read. */
export function readUnit(q: SelectInsertDb): Unit {
  q.insert(userSettings).values({ id: ROW_ID }).onConflictDoNothing().run();
  return q.select({ unit: userSettings.unit }).from(userSettings).get()?.unit ?? "kg";
}

/** Saves the unit. Touches only the settings row: stored weights and entered units never change. */
export function writeUnit(q: SelectInsertDb, unit: Unit): void {
  q.insert(userSettings).values({ id: ROW_ID, unit }).onConflictDoUpdate({ target: userSettings.id, set: { unit } }).run();
}
