/** Time since the workout started, as m:ss, or h:mm:ss from the first hour. Never negative. */
export function elapsedText(startedAt: number, now: number): string {
  const total = Math.max(0, Math.floor((now - startedAt) / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/** The bar's line: routine name and elapsed time. */
export function barText(routineName: string, startedAt: number, now: number): string {
  return `${routineName} · ${elapsedText(startedAt, now)}`;
}
