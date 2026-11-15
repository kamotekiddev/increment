import { eq } from "drizzle-orm";

import type { Db } from "./client";
import library from "./library/exercises.json";
import { exercises, settings } from "./schema";

const SEED_KEY = "librarySeedVersion";
const SEED_VERSION = 1;
// 7 columns per row; stay well under SQLite's variable limit.
const CHUNK = 50;

/** Insert the curated library once. Safe to call on every launch. */
export async function seedLibrary(db: Db): Promise<void> {
  const done = await db.select().from(settings).where(eq(settings.key, SEED_KEY));
  if (done.length > 0 && Number(done[0].value) >= SEED_VERSION) return;

  await db.transaction(async (tx) => {
    for (let i = 0; i < library.length; i += CHUNK) {
      const rows = library.slice(i, i + CHUNK).map((e) => ({
        slug: e.slug,
        name: e.name,
        muscles: e.muscles,
        equipment: e.equipment,
        instructions: e.instructions,
        loadType: e.loadType as "weighted" | "bodyweight" | "bodyweight_or_weighted",
        isCustom: false,
      }));
      await tx.insert(exercises).values(rows).onConflictDoNothing();
    }
    await tx
      .insert(settings)
      .values({ key: SEED_KEY, value: SEED_VERSION })
      .onConflictDoUpdate({ target: settings.key, set: { value: SEED_VERSION } });
  });
}
