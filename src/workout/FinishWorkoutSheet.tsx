import { Button, PromptSheet } from "@/components";

import type { FinishPrompt } from "./workoutPromptText";

export interface FinishWorkoutSheetProps {
  /** The prompt to show, or null when the sheet is closed. */
  prompt: FinishPrompt | null;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** The Finish prompt (unchecked sets, skipped exercises) or, with no sets done, the Discard offer. */
export function FinishWorkoutSheet({ prompt, onConfirm, onDismiss }: FinishWorkoutSheetProps) {
  const discard = prompt?.kind === "discard";
  return (
    <PromptSheet
      visible={prompt !== null}
      onDismiss={onDismiss}
      icon={discard ? "trash-outline" : "checkmark"}
      tone={discard ? "danger" : "accent"}
      title={prompt?.title ?? ""}
      body={prompt?.body ?? ""}
    >
      {prompt ? (
        <>
          <Button label={prompt.confirm} variant={discard ? "danger" : "primary"} large onPress={onConfirm} />
          <Button label={prompt.cancel} variant="secondary" stretch onPress={onDismiss} />
        </>
      ) : null}
    </PromptSheet>
  );
}
