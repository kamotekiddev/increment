/** Local midnight of the Sunday that starts the week containing `now`, epoch ms. */
export function weekStart(now: number): number {
  const d = new Date(now);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay()).getTime();
}

/** Local midnight of the Sunday after the week containing `now`, epoch ms (exclusive end of the week). */
export function weekEnd(now: number): number {
  const d = new Date(weekStart(now));
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + 7).getTime();
}
