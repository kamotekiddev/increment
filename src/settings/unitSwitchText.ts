import type { Unit } from "@/units";

export interface UnitSwitchText {
  title: string;
  body: string;
  /** The phrase of `body` shown in bold: why it rounds down. */
  emphasis: string;
  confirm: string;
  cancel: string;
}

const NAMES: Record<Unit, string> = { kg: "kilograms", lb: "pounds" };

/** The example in the body, keyed by the unit switched to, with the default step (5 lb, 2.5 kg). */
const EXAMPLE: Record<Unit, string> = { lb: "62.5 kg becomes 135 lb", kg: "135 lb becomes 60 kg" };

const EMPHASIS = "so every converted weight is one you can still load";

/** Pure: copy for the confirmation sheet that opens when the lifter taps the other unit in Settings. */
export function unitSwitchText(_from: Unit, to: Unit, workoutInProgress: boolean): UnitSwitchText {
  const base = `Weights you're about to lift are rounded down to each exercise's ${to} step, ${EMPHASIS} (${EXAMPLE[to]}). Sets you logged stay exactly as you typed them. You can switch back any time.`;
  return {
    title: `Switch to ${NAMES[to]}?`,
    body: workoutInProgress ? `${base} In your workout, sets you haven't typed or checked switch to ${to} too.` : base,
    emphasis: EMPHASIS,
    confirm: `Switch to ${NAMES[to]}`,
    cancel: "Cancel",
  };
}
