import type { ExerciseSetup } from "./routineSetup";

/** Pure: seconds as m:ss, for example 150 gives "2:30". */
export function restLabel(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Pure: the row text for a routine exercise, for example "4 sets · 6–8 reps · 2:30 rest". */
export function setupSubtitle({ sets, repMin, repMax, restS }: ExerciseSetup): string {
  const setsText = `${sets} ${sets === 1 ? "set" : "sets"}`;
  const reps = repMin === repMax ? `${repMin}` : `${repMin}–${repMax}`;
  const repsText = `${reps} ${repMax === 1 ? "rep" : "reps"}`;
  return `${setsText} · ${repsText} · ${restLabel(restS)} rest`;
}
