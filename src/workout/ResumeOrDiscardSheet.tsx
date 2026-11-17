import { Button, PromptSheet } from "@/components";

import { resumePromptText } from "./workoutPromptText";

export interface ResumeOrDiscardSheetProps {
  visible: boolean;
  /** The routine of the workout in progress; null when it has none. */
  runningName: string | null;
  startingName: string;
  onResume: () => void;
  onDiscardAndStart: () => void;
  onDismiss: () => void;
}

/** Shown when Start finds a workout already in progress. */
export function ResumeOrDiscardSheet({
  visible,
  runningName,
  startingName,
  onResume,
  onDiscardAndStart,
  onDismiss,
}: ResumeOrDiscardSheetProps) {
  const text = resumePromptText(runningName, startingName);
  return (
    <PromptSheet visible={visible} onDismiss={onDismiss} icon="time-outline" title={text.title} body={text.body}>
      <Button label={text.resume} large onPress={onResume} />
      <Button label={text.discard} variant="dangerText" stretch onPress={onDiscardAndStart} />
      <Button label="Cancel" variant="secondary" stretch onPress={onDismiss} />
    </PromptSheet>
  );
}
