import { DestructiveSheet } from "./DestructiveSheet";
import { deleteRoutineText } from "./deleteRoutineText";

export interface DeleteRoutineSheetProps {
  visible: boolean;
  routineName: string;
  workoutCount: number;
  onConfirm: () => void;
  onDismiss: () => void;
}

/** The ⋯ action on Edit routine: one confirmation that names how many workouts go with the routine. */
export function DeleteRoutineSheet({ visible, routineName, workoutCount, onConfirm, onDismiss }: DeleteRoutineSheetProps) {
  const text = deleteRoutineText(routineName, workoutCount);
  return (
    <DestructiveSheet
      visible={visible}
      title={text.title}
      body={text.body}
      confirmLabel="Delete routine"
      onConfirm={onConfirm}
      onDismiss={onDismiss}
    />
  );
}
