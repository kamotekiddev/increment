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

/** The line under the stats: where the data lives, then the backup state. */
export function storedLine(lastBackupAt: number | null): string {
  return `Stored only on this phone · ${lastBackupLabel(lastBackupAt)}`;
}

/** The stored Last backup date after a share: only a finished share moves it; a cancel or a failure keeps the old one. */
export function lastBackupAfterShare(result: ShareResult, now: number, previous: number | null): number | null {
  return result === "shared" ? now : previous;
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
