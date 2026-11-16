import { DestructiveSheet } from "./DestructiveSheet";
import { removeExerciseText } from "./removeExerciseText";

export interface RemoveExerciseSheetProps {
  visible: boolean;
  exerciseName: string;
  routineName: string;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** Asks before taking an exercise out of a routine. Logged workouts keep it. */
export function RemoveExerciseSheet({ visible, exerciseName, routineName, onConfirm, onDismiss }: RemoveExerciseSheetProps) {
  const text = removeExerciseText(exerciseName, routineName);
  return (
    <DestructiveSheet
      visible={visible}
      title={text.title}
      body={text.body}
      confirmLabel="Remove"
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    />
  );
}
