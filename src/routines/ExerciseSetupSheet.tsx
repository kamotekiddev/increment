import Ionicons from "@expo/vector-icons/Ionicons";
import { useState } from "react";
import { Pressable, View } from "react-native";

import { BottomSheet, Button, Pill, RoundButton, Text } from "@/components";
import type { OverloadRule } from "@/engine";
import { fontSize, minTouch, radius, spacing, useColors } from "@/theme";

import { adjustSetup, canAdjust, type SetupField } from "./adjustSetup";
import { describeRule } from "./describeRule";
import type { ExerciseSetup } from "./routineSetup";
import { SetupStepper } from "./SetupStepper";
import { restLabel } from "./setupText";

export interface ExerciseSetupSheetProps {
  visible: boolean;
  /** Shown as the sheet title. */
  exerciseName: string;
  /** The muted line under the title, for example "Chest · Barbell". */
  subtitle: string;
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
  subtitle,
  initial,
  rule,
  primaryLabel,
  busy = false,
  onSubmit,
  onDismiss,
  onRemove,
}: ExerciseSetupSheetProps) {
  const colors = useColors();
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
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Text variant="title" style={{ lineHeight: 26, letterSpacing: -0.4 }} numberOfLines={2}>
            {exerciseName}
          </Text>
          <Text variant="caption" tone="muted" style={{ fontSize: fontSize.small }}>
            {subtitle}
          </Text>
        </View>
        <RoundButton icon="close" label="Close" onPress={onDismiss} />
      </View>
      <View style={{ gap: spacing.sm }}>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {stepper("sets", "Sets", String(setup.sets))}
          {stepper("restS", "Rest", restLabel(setup.restS))}
        </View>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          {stepper("repMin", "Reps min", String(setup.repMin))}
          {stepper("repMax", "Reps max", String(setup.repMax))}
        </View>
      </View>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingVertical: spacing.md,
          paddingHorizontal: 14,
          borderRadius: radius.inset,
          borderWidth: 1,
          borderColor: colors.line,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: radius.tile,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.sunk,
          }}
        >
          <Ionicons name="lock-closed-outline" size={15} color={colors.inkMuted} />
        </View>
        <View style={{ flex: 1 }}>
          <Text variant="caption" tone="muted">
            Progression
          </Text>
          <Text variant="label" style={{ fontSize: fontSize.meta, lineHeight: 19 }}>
            {describeRule(rule)}
          </Text>
        </View>
        <Pill label="Pro" tone="solid" />
      </View>
      <Text variant="caption" tone="muted" style={{ fontSize: fontSize.caption, paddingHorizontal: 2 }}>
        Set your own rule with Pro.
      </Text>
      <Button label={primaryLabel} large disabled={busy} onPress={() => onSubmit(setup)} />
      {onRemove ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRemove}
          style={{ minHeight: minTouch, alignItems: "center", justifyContent: "center", borderRadius: radius.pill }}
        >
          <Text variant="label" tone="danger" style={{ fontSize: fontSize.body }}>
            Remove from routine
          </Text>
        </Pressable>
      ) : null}
    </BottomSheet>
  );
}
