import { Pressable, type PressableProps } from "react-native";

import { fontSize, minTouch, opacity, radius, spacing, useColors } from "@/theme";
import { Text } from "./Text";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  /**
   * Primary is the one loud accent block on a screen; secondary is white; danger is the red
   * destructive action; dashed is the dashed "add" action; outlined is white with a solid border
   * (the quieter of two choices); dangerText is white with red text (a destructive choice that
   * is not the main action).
   */
  variant?: "primary" | "secondary" | "danger" | "dangerText" | "dashed" | "outlined";
  /** Stretches to the full width and uses the taller 56 pt height of the main screen action. */
  large?: boolean;
  /** Stretches to the full width at 52 pt: the secondary buttons under a large one in a sheet. */
  stretch?: boolean;
}

export function Button({ label, variant = "primary", large = false, stretch = false, disabled, ...rest }: ButtonProps) {
  const colors = useColors();
  const filled = variant === "primary" || variant === "danger";
  const background =
    variant === "primary"
      ? colors.accent
      : variant === "danger"
        ? colors.danger
        : variant === "secondary" || variant === "outlined" || variant === "dangerText"
          ? colors.card
          : "transparent";
  const fullWidth = large || stretch;
  const height = large ? 56 : stretch ? 52 : minTouch;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => ({
        minHeight: height,
        height: fullWidth ? height : undefined,
        alignSelf: fullWidth ? "stretch" : "flex-start",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: background,
        borderWidth: variant === "dashed" ? 1.5 : variant === "outlined" ? 2 : 0,
        borderStyle: variant === "dashed" ? "dashed" : "solid",
        borderColor: variant === "outlined" ? colors.lineStrong : colors.iconFaint,
        opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
      })}
    >
      <Text
        variant="label"
        tone={filled ? "onAccent" : variant === "dangerText" ? "danger" : "ink"}
        style={large ? { fontSize: fontSize.action } : undefined}
      >
        {label}
      </Text>
    </Pressable>
  );
}
