import type { Db } from "@/db/client";
import { settings } from "@/db/schema";

import {
  readAutoBackupSettings,
  readLastBackupHash,
  writeAutoBackupFolder,
  writeAutoBackupFrequency,
  writeAutoBackupKeep,
  writeAutoBackupOn,
  writeLastBackupHash,
} from "./autoBackupSettings";

jest.mock("@/db/client", () => ({ db: jest.requireActual("../../test-support/testDb").createTestDb() }));
const db: Db = jest.requireMock("@/db/client").db;

beforeEach(() => {
  db.delete(settings).run();
});

describe("Automatic backups settings", () => {
  it("default to off, Keep 5, no folder", () => {
    expect(readAutoBackupSettings()).toEqual({ on: false, keep: 5, folder: null, frequency: "afterEvery" });
    expect(readLastBackupHash()).toBeNull();
  });

  it("read back what was stored", () => {
    writeAutoBackupOn(true);
    writeAutoBackupKeep(10);
    writeAutoBackupFolder("content://x/tree/Backups");
    writeLastBackupHash("abc");
    expect(readAutoBackupSettings()).toEqual({ on: true, keep: 10, folder: "content://x/tree/Backups", frequency: "afterEvery" });
    writeAutoBackupFrequency("weekly");
    expect(readAutoBackupSettings().frequency).toBe("weekly");
    expect(readLastBackupHash()).toBe("abc");
    writeAutoBackupOn(false);
    expect(readAutoBackupSettings().on).toBe(false);
  });
});
