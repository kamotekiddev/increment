/** A rep count as text: "1 rep", "8 reps". */
export function repsText(reps: number): string {
  return `${reps} ${reps === 1 ? "rep" : "reps"}`;
}
