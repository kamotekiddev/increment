export const MAX_STEPS = 10;
export const MAX_STEP_LENGTH = 200;

/** Pure: adds an empty box at the end. `index` is the new box (to focus), or null when 10 steps are already there. */
export function addStep(steps: readonly string[]): { steps: string[]; index: number | null } {
  if (steps.length >= MAX_STEPS) return { steps: [...steps], index: null };
  return { steps: [...steps, ""], index: steps.length };
}

/** Pure: removes the box at `index`. */
export function removeStep(steps: readonly string[], index: number): string[] {
  return steps.filter((_, i) => i !== index);
}

/** Pure: sets one box, cut to 200 characters. */
export function setStep(steps: readonly string[], index: number, text: string): string[] {
  return steps.map((s, i) => (i === index ? text.slice(0, MAX_STEP_LENGTH) : s));
}

/** Pure: the steps to save: trimmed, with empty boxes ignored. */
export function cleanSteps(steps: readonly string[]): string[] {
  return steps.map((s) => s.trim()).filter((s) => s.length > 0);
}
