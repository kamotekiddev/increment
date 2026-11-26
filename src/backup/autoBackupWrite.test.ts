import { autoBackupFileName } from "./autoBackupText";
import { writeAutoBackup, type BackupFolder } from "./autoBackupWrite";

const NOW = new Date(2026, 10, 20, 9, 30).getTime();

function fakeFolder(initial: string[] = [], opts: { failWrite?: boolean; failList?: boolean; failRemove?: boolean } = {}) {
  const files = new Map<string, string>(initial.map((n) => [n, ""]));
  const folder: BackupFolder = {
    names: () => {
      if (opts.failList) throw new Error("revoked");
      return [...files.keys()];
    },
    write: (name, text) => {
      if (opts.failWrite) throw new Error("full");
      files.set(name, text);
    },
    remove: (name) => {
      if (opts.failRemove) throw new Error("locked");
      files.delete(name);
    },
  };
  return { folder, files };
}

const day = (d: number) => autoBackupFileName(new Date(2026, 10, d, 9, 30), []);

describe("writeAutoBackup", () => {
  it("writes the file, records the time and fingerprint, and returns saved", () => {
    const { folder, files } = fakeFolder();
    const onWritten = jest.fn();
    expect(writeAutoBackup({ folder, text: '{"exported_at":5}', now: NOW, keep: 5, onWritten })).toBe("saved");
    expect([...files.keys()]).toEqual(["Increment auto backup 20 Nov 2026 09-30.increment"]);
    expect(onWritten).toHaveBeenCalledWith({ at: NOW, hash: expect.any(String) });
  });

  it("prunes to Keep, touching only auto files", () => {
    const manual = "Increment backup 1 Nov 2026.increment";
    const { folder, files } = fakeFolder([day(1), day(2), day(3), manual, "photo.jpg"]);
    writeAutoBackup({ folder, text: "{}", now: NOW, keep: 2, onWritten: () => {} });
    expect([...files.keys()].sort()).toEqual([manual, "photo.jpg", day(3), "Increment auto backup 20 Nov 2026 09-30.increment"].sort());
  });

  it("numbers a same-minute name", () => {
    const { folder, files } = fakeFolder(["Increment auto backup 20 Nov 2026 09-30.increment"]);
    writeAutoBackup({ folder, text: "{}", now: NOW, keep: 5, onWritten: () => {} });
    expect(files.has("Increment auto backup 20 Nov 2026 09-30 (2).increment")).toBe(true);
  });

  it("is failed with no folder, and records nothing", () => {
    const onWritten = jest.fn();
    expect(writeAutoBackup({ folder: null, text: "{}", now: NOW, keep: 5, onWritten })).toBe("failed");
    expect(onWritten).not.toHaveBeenCalled();
  });

  it("is failed, never a throw, when the folder is revoked or the write fails", () => {
    const onWritten = jest.fn();
    expect(writeAutoBackup({ folder: fakeFolder([], { failList: true }).folder, text: "{}", now: NOW, keep: 5, onWritten })).toBe("failed");
    expect(writeAutoBackup({ folder: fakeFolder([], { failWrite: true }).folder, text: "{}", now: NOW, keep: 5, onWritten })).toBe("failed");
    expect(onWritten).not.toHaveBeenCalled();
  });

  it("stays saved when a prune delete fails", () => {
    const { folder } = fakeFolder([day(1), day(2)], { failRemove: true });
    expect(writeAutoBackup({ folder, text: "{}", now: NOW, keep: 1, onWritten: () => {} })).toBe("saved");
  });
});
