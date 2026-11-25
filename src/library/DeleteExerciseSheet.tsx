import { DestructiveSheet } from "@/routines/DestructiveSheet";

import type { ExerciseDeleteInfo } from "./deleteCustomExercise";
import { deleteExerciseText } from "./deleteExerciseText";

export interface DeleteExerciseSheetProps {
  visible: boolean;
  name: string;
  /** Null while the sheet is closed. */
  info: ExerciseDeleteInfo | null;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** Edit exercise's Delete: names the routines it leaves and warns its history goes for good; disabled while a Workout in progress has it. */
export function DeleteExerciseSheet({ visible, name, info, onConfirm, onDismiss }: DeleteExerciseSheetProps) {
  if (!info) return null;
  const text = deleteExerciseText(name, info);
  return (
    <DestructiveSheet
      visible={visible}
      title={text.title}
      body={text.body}
      warning={text.warning}
      confirmLabel="Delete exercise"
      confirmDisabled={text.blocked}
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    />
  );
}
