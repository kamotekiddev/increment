import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { fontFamily, fontSize, minTouch, opacity, radius, spacing, useColors } from "@/theme";

export interface SetupStepperProps {
  label: string;
  /** The value as shown, for example "3" or "1:30". */
  valueText: string;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease: boolean;
  canIncrease: boolean;
}

/** A tile with the label, the value, and minus and plus buttons, each at least 44 pt. */
export function SetupStepper({ label, valueText, onDecrease, onIncrease, canDecrease, canIncrease }: SetupStepperProps) {
  const colors = useColors();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        gap: 6,
        paddingTop: spacing.md,
        paddingBottom: spacing.sm,
        paddingHorizontal: spacing.sm,
        borderRadius: radius.inset,
        backgroundColor: colors.sunk,
      }}
    >
      <Text variant="caption" tone="muted" style={{ fontFamily: fontFamily.medium }}>
        {label}
      </Text>
      <Text variant="title" style={{ fontSize: fontSize.titleLg, lineHeight: 26, letterSpacing: -0.4 }}>
        {valueText}
      </Text>
      <View style={{ flexDirection: "row", gap: 6 }}>
        <StepButton icon="remove" label={`Decrease ${label}`} onPress={onDecrease} disabled={!canDecrease} />
        <StepButton icon="add" label={`Increase ${label}`} onPress={onIncrease} disabled={!canIncrease} />
      </View>
    </View>
  );
}

function StepButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: "add" | "remove";
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: minTouch,
        height: minTouch,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: radius.pill,
        backgroundColor: pressed ? colors.line : colors.card,
        opacity: disabled ? opacity.disabled : 1,
      })}
    >
      <Ionicons name={icon} size={20} color={colors.ink} />
    </Pressable>
  );
}
