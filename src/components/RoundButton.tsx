import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";
import { Pressable } from "react-native";

import { opacity, radius, size, useColors } from "@/theme";

export interface RoundButtonProps {
  icon: ComponentProps<typeof Ionicons>["name"];
  /** Spoken label; the button has no visible text. */
  label: string;
  onPress: () => void;
  /** Accent fill instead of white (the New routine "+"). */
  filled?: boolean;
  disabled?: boolean;
}

/** The 48 pt round icon button used in screen headers: back, close, more, add. */
export function RoundButton({ icon, label, onPress, filled = false, disabled = false }: RoundButtonProps) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        width: size.round, height: size.round,
        borderRadius: radius.pill,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: filled ? colors.accent : colors.card,
        opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
      })}
    >
      <Ionicons name={icon} size={22} color={filled ? colors.onAccent : colors.ink} />
    </Pressable>
  );
}
