import { useIsPro } from "@/pro";

import { saveButtonKind } from "./customExerciseGate";

/**
 * The one place that reads the Pro gate for custom exercises (product rule 7). Screens get the button
 * kind and never see `isPro`. The form opens for everyone; only the save button is gated.
 */
export function useSaveButtonKind(): "save" | "unlock" {
  return saveButtonKind(useIsPro());
}
