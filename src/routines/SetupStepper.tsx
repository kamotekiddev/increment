import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { minTouch, opacity, radius, spacing, useColors } from "@/theme";

export interface SetupStepperProps {
  label: string;
  /** The value as shown, for example "3" or "1:30". */
  valueText: string;
  onDecrease: () => void;
  onIncrease: () => void;
  canDecrease: boolean;
  canIncrease: boolean;
}

/** A label with a value between minus and plus buttons, each at least 44 pt. */
export function SetupStepper({ label, valueText, onDecrease, onIncrease, canDecrease, canIncrease }: SetupStepperProps) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", minHeight: minTouch }}>
      <Text variant="label" style={{ flex: 1 }}>
        {label}
      </Text>
      <StepButton icon="remove" label={`Decrease ${label}`} onPress={onDecrease} disabled={!canDecrease} />
      <Text variant="label" style={{ minWidth: minTouch + spacing.md, textAlign: "center" }}>
        {valueText}
      </Text>
      <StepButton icon="add" label={`Increase ${label}`} onPress={onIncrease} disabled={!canIncrease} />
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
        backgroundColor: pressed ? colors.line : colors.sunk,
        opacity: disabled ? opacity.disabled : 1,
      })}
    >
      <Ionicons name={icon} size={20} color={colors.ink} />
    </Pressable>
  );
}
