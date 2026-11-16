import { eq } from "drizzle-orm";

import { db } from "@/db/client";
import { routineExercises } from "@/db/schema";

/**
 * Saves a new order in one transaction: `ids` (routine exercise ids) get positions 0..n-1.
 * The expo-sqlite driver runs a transaction synchronously, so the callback must not be async.
 */
export function saveExerciseOrder(ids: readonly number[]): void {
  db.transaction((tx) => {
    ids.forEach((id, position) => {
      tx.update(routineExercises).set({ position }).where(eq(routineExercises.id, id)).run();
    });
  });
}
