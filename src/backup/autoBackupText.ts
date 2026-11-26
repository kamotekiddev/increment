import { uniqueFileName } from "./backupText";

/** Every automatic backup file starts with this; Keep prunes only files that do. */
export const AUTO_PREFIX = "Increment auto backup";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad = (n: number): string => String(n).padStart(2, "0");

/** `Increment auto backup 14 Nov 2026 18-42.increment` (local time), numbered "(2)" if the folder already has it. */
export function autoBackupFileName(date: Date, existing: readonly string[]): string {
  const stamp = `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()} ${pad(date.getHours())}-${pad(date.getMinutes())}`;
  return uniqueFileName(`${AUTO_PREFIX} ${stamp}.increment`, existing);
}

const NAME = new RegExp(`^${AUTO_PREFIX} (\\d{1,2}) (${MONTHS.join("|")}) (\\d{4}) (\\d{2})-(\\d{2})(?: \\((\\d+)\\))?\\.increment$`);

/** When an auto backup name was written (minute) and its "(n)" number; null for any other name. */
function parseAutoName(name: string): { at: number; n: number } | null {
  const m = NAME.exec(name);
  if (!m) return null;
  const at = new Date(Number(m[3]), MONTHS.indexOf(m[2]), Number(m[1]), Number(m[4]), Number(m[5])).getTime();
  return { at, n: m[6] ? Number(m[6]) : 1 };
}

export const isAutoBackupName = (name: string): boolean => parseAutoName(name) !== null;

/**
 * The names to delete after a write: the oldest auto backup files beyond `keep`. A manual backup, a stranger and a
 * file with the prefix but a name this app didn't write are never listed.
 */
export function autoBackupPrune(names: readonly string[], keep: number): string[] {
  const auto = names
    .map((name) => ({ name, parsed: parseAutoName(name) }))
    .filter((e): e is { name: string; parsed: { at: number; n: number } } => e.parsed !== null)
    .sort((a, b) => b.parsed.at - a.parsed.at || b.parsed.n - a.parsed.n);
  return auto.slice(Math.max(0, keep)).map((e) => e.name);
}

/** A fingerprint of the backup's content: the text without `exported_at`, so a new export time alone changes nothing. */
export function contentFingerprint(text: string): string {
  const body = text.replace(/"exported_at":-?\d+(\.\d+)?/, '"exported_at":0');
  // cyrb53: a fast 53-bit string hash. Not a security hash: it only has to notice a change.
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < body.length; i++) {
    const ch = body.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16);
}

export const KEEP_OPTIONS = [3, 5, 10, 20] as const;
export type Keep = (typeof KEEP_OPTIONS)[number];
export const KEEP_DEFAULT: Keep = 5;

/** A stored Keep value, or the default when it is missing or not one of the four choices. */
export function parseKeep(value: unknown): Keep {
  return KEEP_OPTIONS.find((k) => k === value) ?? KEEP_DEFAULT;
}

/** The folder's own name from an Android tree uri ("Documents/Increment"), for the Folder row. */
export function folderLabel(uri: string): string {
  const tree = uri.split("/tree/")[1] ?? uri;
  let decoded = tree;
  try {
    decoded = decodeURIComponent(tree);
  } catch {
    // keep the raw text
  }
  const afterVolume = decoded.includes(":") ? decoded.slice(decoded.indexOf(":") + 1) : decoded;
  return afterVolume.replace(/\/+$/, "") || decoded;
}
