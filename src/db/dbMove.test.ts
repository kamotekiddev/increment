import { moveDatabase, type DbFiles } from "./dbMove";

/** An in-memory stand-in for the two folders: path -> byte size. */
function fakeFiles(initial: Record<string, number>): DbFiles & { fs: Map<string, number> } {
  const fs = new Map(Object.entries(initial));
  return {
    fs,
    exists: (p) => fs.has(p),
    size: (p) => fs.get(p) ?? 0,
    copy: (from, to) => void fs.set(to, fs.get(from) as number),
    rename: (from, to) => {
      fs.set(to, fs.get(from) as number);
      fs.delete(from);
    },
    remove: (p) => void fs.delete(p),
    ensureDir: () => {},
  };
}

const OLD = "old";
const NEW = "new";

describe("moveDatabase", () => {
  it("copies the database and its wal and shm to the new folder, then removes the old files", () => {
    const f = fakeFiles({ "old/increment.db": 100, "old/increment.db-wal": 20, "old/increment.db-shm": 5 });
    expect(moveDatabase(f, OLD, NEW, "increment.db")).toBe("moved");
    expect([...f.fs.entries()].sort()).toEqual([
      ["new/increment.db", 100],
      ["new/increment.db-shm", 5],
      ["new/increment.db-wal", 20],
    ]);
  });

  it("moves a database that has no wal or shm", () => {
    const f = fakeFiles({ "old/increment.db": 100 });
    expect(moveDatabase(f, OLD, NEW, "increment.db")).toBe("moved");
    expect([...f.fs.keys()]).toEqual(["new/increment.db"]);
  });

  it("does nothing on a fresh install (no old database)", () => {
    const f = fakeFiles({});
    expect(moveDatabase(f, OLD, NEW, "increment.db")).toBe("nothing");
    expect(f.fs.size).toBe(0);
  });

  it("never overwrites: a database already in the new folder wins and the old files stay", () => {
    const f = fakeFiles({ "old/increment.db": 100, "new/increment.db": 300 });
    expect(moveDatabase(f, OLD, NEW, "increment.db")).toBe("nothing");
    expect(f.fs.get("new/increment.db")).toBe(300);
    expect(f.fs.get("old/increment.db")).toBe(100);
  });

  it("keeps the old files and removes the copies when a copy does not match in size", () => {
    const f = fakeFiles({ "old/increment.db": 100, "old/increment.db-wal": 20 });
    f.copy = (from, to) => void f.fs.set(to, (f.fs.get(from) as number) - 1);
    expect(moveDatabase(f, OLD, NEW, "increment.db")).toBe("failed");
    expect([...f.fs.keys()].sort()).toEqual(["old/increment.db", "old/increment.db-wal"]);
  });

  it("keeps the old files when a copy throws, and leaves no new database behind", () => {
    const f = fakeFiles({ "old/increment.db": 100 });
    f.copy = () => {
      throw new Error("disk full");
    };
    expect(moveDatabase(f, OLD, NEW, "increment.db")).toBe("failed");
    expect([...f.fs.keys()]).toEqual(["old/increment.db"]);
  });

  it("the new database appears only once complete, so a stop mid-move is retried whole", () => {
    const f = fakeFiles({ "old/increment.db": 100, "old/increment.db-wal": 20 });
    const copy = f.copy;
    f.copy = (from, to) => {
      if (from.endsWith("-wal")) throw new Error("killed");
      copy(from, to);
    };
    expect(moveDatabase(f, OLD, NEW, "increment.db")).toBe("failed");
    expect(f.fs.has("new/increment.db")).toBe(false);
    expect(f.fs.has("old/increment.db")).toBe(true);
  });

  it("a failed removal of the old files still counts as moved", () => {
    const f = fakeFiles({ "old/increment.db": 100 });
    f.remove = () => {
      throw new Error("busy");
    };
    expect(moveDatabase(f, OLD, NEW, "increment.db")).toBe("moved");
    expect(f.fs.get("new/increment.db")).toBe(100);
  });
});
