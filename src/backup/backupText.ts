import type { Unit } from "@/units";

/** How a share ended: the sheet reported it finished, the lifter dismissed it, or it could not open. */
export type ShareResult = "shared" | "dismissed" | "failed";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** The stats card's backup line: "No backup yet" or "Last backup 14 Nov 2026" (local date). */
export function lastBackupLabel(lastBackupAt: number | null): string {
  if (lastBackupAt === null) return "No backup yet";
  const d = new Date(lastBackupAt);
  return `Last backup ${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * The pill under the stats: "No backup yet" or "Backed up 14 Nov" (local date; the year is added only when it isn't
 * the current one, so the pill stays short).
 */
export function backedUpLabel(lastBackupAt: number | null, now: number): string {
  if (lastBackupAt === null) return "No backup yet";
  const d = new Date(lastBackupAt);
  const year = d.getFullYear() === new Date(now).getFullYear() ? "" : ` ${d.getFullYear()}`;
  return `Backed up ${d.getDate()} ${MONTHS[d.getMonth()]}${year}`;
}

/** The Automatic backups row's second line on Your data: "Off", or "Every week · keeps 5". */
export function autoBackupSummary(on: boolean, frequencyLabel: string, keep: number): string {
  return on ? `${frequencyLabel} · keeps ${keep}` : "Off";
}

/** The stored Last backup date after a share: only a finished share moves it; a cancel or a failure keeps the old one. */
export function lastBackupAfterShare(result: ShareResult, now: number, previous: number | null): number | null {
  return result === "shared" ? now : previous;
}

/** How a folder save ended: written, the lifter backed out of the folder pick, or the write failed. */
export type FolderSaveResult = "saved" | "cancelled" | "failed";

/** The stored Last backup date after an Android folder save: only a written file moves it. */
export function lastBackupAfterFolderSave(result: FolderSaveResult, now: number, previous: number | null): number | null {
  return result === "saved" ? now : previous;
}

/**
 * The Last backup rule for the Share button per platform. iOS follows the share sheet's result. Android's sheet can't
 * report the outcome, so sharing there never sets it (only a folder save does).
 */
export function lastBackupAfterShareOn(os: string, result: ShareResult, now: number, previous: number | null): number | null {
  return os === "android" ? previous : lastBackupAfterShare(result, now, previous);
}

/** `name` if no file in the folder has it, else "name (2).ext", "name (3).ext"... (the number goes before the extension). */
export function uniqueFileName(name: string, existing: readonly string[]): string {
  const taken = new Set(existing);
  if (!taken.has(name)) return name;
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  let n = 2;
  while (taken.has(`${base} (${n})${ext}`)) n += 1;
  return `${base} (${n})${ext}`;
}

/** The Settings line on Backup ready, like "kg, 2:30 rest". */
export function settingsSummary(unit: Unit, defaultRestS: number): string {
  const minutes = Math.floor(defaultRestS / 60);
  const seconds = String(defaultRestS % 60).padStart(2, "0");
  return `${unit}, ${minutes}:${seconds} rest`;
}

/** The file size under the file name: whole KB (at least 1), or MB with one decimal from 1024 KB. */
export function fileSizeText(bytes: number): string {
  const kb = Math.max(1, Math.ceil(bytes / 1024));
  return kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;
}
