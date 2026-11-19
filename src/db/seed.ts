import { eq, sql } from "drizzle-orm";

import type { LoadType } from "@/engine";

import type { Db } from "./client";
import library from "./library/exercises.json";
import { exercises, settings } from "./schema";

const SEED_KEY = "librarySeedVersion";
/**
 * Bump when exercises.json changes; existing library rows are updated by slug. Custom rows are left alone,
 * except that version 2 turns any row of the removed load type `bodyweight_or_weighted` into `bodyweight`.
 */
const SEED_VERSION = 2;
// 7 columns per row; stay well under SQLite's variable limit.
const CHUNK = 50;

/**
 * Insert or update the curated library. Safe to call on every launch, and runs once per version.
 * The expo-sqlite driver is synchronous, so the transaction callback is synchronous too; that is
 * what makes the whole seed one atomic unit.
 */
export function seedLibrary(db: Db): void {
  const done = db.select().from(settings).where(eq(settings.key, SEED_KEY)).all();
  if (done.length > 0 && Number(done[0].value) >= SEED_VERSION) return;

  db.transaction((tx) => {
    // Version 2 split each "bodyweight or weighted" exercise in two. The upsert below turns the library
    // originals into the bodyweight one (same id, so logged history stays); this catches any other row.
    tx.run(sql`UPDATE exercises SET load_type = 'bodyweight' WHERE load_type = 'bodyweight_or_weighted'`);
    for (let i = 0; i < library.length; i += CHUNK) {
      const rows = library.slice(i, i + CHUNK).map((e) => ({
        slug: e.slug,
        name: e.name,
        muscles: e.muscles,
        equipment: e.equipment,
        instructions: e.instructions,
        loadType: e.loadType as LoadType,
        isCustom: false,
      }));
      tx.insert(exercises)
        .values(rows)
        .onConflictDoUpdate({
          target: exercises.slug,
          set: {
            name: sql`excluded.name`,
            muscles: sql`excluded.muscles`,
            equipment: sql`excluded.equipment`,
            instructions: sql`excluded.instructions`,
            loadType: sql`excluded.load_type`,
          },
        })
        .run();
    }
    tx.insert(settings)
      .values({ key: SEED_KEY, value: SEED_VERSION })
      .onConflictDoUpdate({ target: settings.key, set: { value: SEED_VERSION } })
      .run();
  });
}
