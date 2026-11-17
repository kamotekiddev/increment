/** When the app was last not in the foreground: `to` is null while it is still away. */
export interface AwayTrace {
  from: number;
  to: number | null;
}

/** Updates the away trace for an app state change (`AppState` values), at clock time `now`. */
export function trackAway(trace: AwayTrace | null, state: string, now: number): AwayTrace | null {
  if (state !== "active") return trace && trace.to === null ? trace : { from: now, to: null };
  return trace && trace.to === null ? { from: trace.from, to: now } : trace;
}

/** True when the app was away (or on its way out) at the moment a rest ended, so there is nothing to buzz at. */
export function endedWhileAway(endsAt: number, trace: AwayTrace | null): boolean {
  if (!trace || trace.from >= endsAt) return false;
  return trace.to === null || trace.to > endsAt;
}
