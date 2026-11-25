import Ionicons from "@expo/vector-icons/Ionicons";
import { useEffect, useRef } from "react";
import { Pressable, TextInput, View } from "react-native";

import { Text } from "@/components";
import { fontFamily, fontSize, minTouch, radius, size, spacing, useColors } from "@/theme";

import { addStep, MAX_STEP_LENGTH, MAX_STEPS, removeStep, setStep } from "./exerciseSteps";

export interface StepsFieldProps {
  steps: string[];
  onChange: (steps: string[]) => void;
}

/** The "How to do it" step boxes: a numbered badge, a remove button per box, and "+ Add step" that focuses the new box. */
export function StepsField({ steps, onChange }: StepsFieldProps) {
  const colors = useColors();
  const inputs = useRef<({ focus: () => void } | null)[]>([]);
  const focusNext = useRef<number | null>(null);

  // Focus the box added by "+ Add step" once it has rendered.
  useEffect(() => {
    if (focusNext.current !== null) {
      inputs.current[focusNext.current]?.focus();
      focusNext.current = null;
    }
  }, [steps.length]);

  return (
    <View style={{ gap: spacing.sm }}>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: spacing.snug, paddingHorizontal: spacing.xs }}>
        <Text variant="caption" tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium }}>
          How to do it
        </Text>
        <Text variant="caption" tone="muted" style={{ fontSize: fontSize.small }}>
          (optional)
        </Text>
      </View>
      {steps.map((step, index) => (
        <View key={index} style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              width: size.stepNumber + 2,
              height: size.stepNumber + 2,
              borderRadius: radius.pill,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: colors.accentTint,
            }}
          >
            <Text variant="caption" tone="accent" style={{ fontFamily: fontFamily.bold }}>
              {index + 1}
            </Text>
          </View>
          <TextInput
            ref={(node) => {
              inputs.current[index] = node;
            }}
            value={step}
            onChangeText={(text) => onChange(setStep(steps, index, text))}
            accessibilityLabel={`Step ${index + 1}`}
            maxLength={MAX_STEP_LENGTH}
            multiline
            placeholderTextColor={colors.inkMuted}
            style={{
              flex: 1,
              minHeight: 46,
              borderRadius: radius.md,
              paddingHorizontal: spacing.lg,
              paddingVertical: spacing.md,
              backgroundColor: colors.card,
              color: colors.ink,
              fontFamily: fontFamily.regular,
              fontSize: fontSize.label,
            }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Remove step ${index + 1}`}
            onPress={() => onChange(removeStep(steps, index))}
            style={{ width: minTouch, height: minTouch, alignItems: "center", justifyContent: "center" }}
          >
            <Ionicons name="close" size={18} color={colors.iconFaint} />
          </Pressable>
        </View>
      ))}
      {steps.length < MAX_STEPS ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add step"
          onPress={() => {
            const next = addStep(steps);
            if (next.index === null) return;
            focusNext.current = next.index;
            onChange(next.steps);
          }}
          style={{
            height: minTouch,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: spacing.snug,
            borderRadius: radius.row,
            borderWidth: 1.5,
            borderStyle: "dashed",
            borderColor: colors.lineStrong,
          }}
        >
          <Ionicons name="add" size={size.icon} color={colors.accent} />
          <Text variant="label" tone="accent">
            Add step
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
