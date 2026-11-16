import { useState } from "react";
import { Pressable, View } from "react-native";

import { BottomSheet, Button, Pill, Text } from "@/components";
import type { OverloadRule } from "@/engine";
import { minTouch, spacing } from "@/theme";

import { adjustSetup, canAdjust, type SetupField } from "./adjustSetup";
import { describeRule } from "./describeRule";
import type { ExerciseSetup } from "./routineSetup";
import { SetupStepper } from "./SetupStepper";
import { restLabel } from "./setupText";

export interface ExerciseSetupSheetProps {
  visible: boolean;
  /** Shown as the sheet title. */
  exerciseName: string;
  /** The steppers start here each time the sheet opens. */
  initial: ExerciseSetup;
  /** Shown read-only with a Pro badge; there is no way to change it before Pro. */
  rule: OverloadRule;
  /** The primary button, for example "Add to routine" or "Save". */
  primaryLabel: string;
  /** Disables the primary button while a save is in flight. */
  busy?: boolean;
  onSubmit: (setup: ExerciseSetup) => void;
  onDismiss: () => void;
  /** Editing only: shows a red Remove from routine action that calls this. */
  onRemove?: () => void;
}

/** Sets, reps (min and max) and rest steppers, the read-only progression rule and one primary button. */
export function ExerciseSetupSheet({
  visible,
  exerciseName,
  initial,
  rule,
  primaryLabel,
  busy = false,
  onSubmit,
  onDismiss,
  onRemove,
}: ExerciseSetupSheetProps) {
  const [setup, setSetup] = useState<ExerciseSetup>(initial);

  // Start from the given values every time the sheet opens (reset during render, not in an effect).
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setSetup(initial);
  }

  const stepper = (field: SetupField, label: string, valueText: string) => (
    <SetupStepper
      label={label}
      valueText={valueText}
      canDecrease={canAdjust(setup, field, -1)}
      canIncrease={canAdjust(setup, field, 1)}
      onDecrease={() => setSetup((s) => adjustSetup(s, field, -1))}
      onIncrease={() => setSetup((s) => adjustSetup(s, field, 1))}
    />
  );

  return (
    <BottomSheet visible={visible} onDismiss={onDismiss}>
      <Text variant="title" numberOfLines={2}>
        {exerciseName}
      </Text>
      <View style={{ gap: spacing.xs }}>
        {stepper("sets", "Sets", String(setup.sets))}
        {stepper("repMin", "Reps min", String(setup.repMin))}
        {stepper("repMax", "Reps max", String(setup.repMax))}
        {stepper("restS", "Rest", restLabel(setup.restS))}
      </View>
      <View style={{ gap: spacing.xs }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: spacing.md }}>
          <Text variant="label">Progression</Text>
          <Pill label="Pro" />
        </View>
        <Text tone="muted">{describeRule(rule)}</Text>
      </View>
      <Button label={primaryLabel} disabled={busy} onPress={() => onSubmit(setup)} />
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRemove}
          style={{ minHeight: minTouch, alignItems: "center", justifyContent: "center" }}
        >
          <Text variant="label" tone="danger">
            Remove from routine
          </Text>
        </Pressable>
      ) : null}
    </BottomSheet>
  );
}
