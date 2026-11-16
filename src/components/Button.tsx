import { Pressable, type PressableProps } from "react-native";

import { fontSize, minTouch, opacity, radius, spacing, useColors } from "@/theme";
import { Text } from "./Text";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  /**
   * Primary is the one loud accent block on a screen; secondary is white; danger is the red
   * destructive action; dashed is the outlined "add" action.
   */
  variant?: "primary" | "secondary" | "danger" | "dashed";
  /** Stretches to the full width and uses the taller 56 pt height of the main screen action. */
  large?: boolean;
}

export function Button({ label, variant = "primary", large = false, disabled, ...rest }: ButtonProps) {
  const colors = useColors();
  const filled = variant === "primary" || variant === "danger";
  const background =
    variant === "primary" ? colors.accent : variant === "danger" ? colors.danger : variant === "secondary" ? colors.card : "transparent";
  const height = large ? 56 : minTouch;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => ({
        minHeight: height,
        height: large ? height : undefined,
        alignSelf: large ? "stretch" : "flex-start",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: background,
        borderWidth: variant === "dashed" ? 1.5 : 0,
        borderStyle: variant === "dashed" ? "dashed" : "solid",
        borderColor: colors.iconFaint,
        opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
      })}
    >
      <Text variant="label" tone={filled ? "onAccent" : "ink"} style={large ? { fontSize: fontSize.action } : undefined}>
        {label}
      </Text>
    </Pressable>
  );
}
