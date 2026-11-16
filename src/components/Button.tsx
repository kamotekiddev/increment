import { Pressable, type PressableProps } from "react-native";

import { minTouch, opacity, radius, spacing, useColors } from "@/theme";
import { Text } from "./Text";

export interface ButtonProps extends Omit<PressableProps, "children" | "style"> {
  label: string;
  /** Primary is the one loud accent block on a screen; secondary is white with a border. */
  variant?: "primary" | "secondary";
}

export function Button({ label, variant = "primary", disabled, ...rest }: ButtonProps) {
  const colors = useColors();
  const primary = variant === "primary";
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled}
      {...rest}
      style={({ pressed }) => ({
        minHeight: minTouch,
        alignSelf: "flex-start",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: spacing.xxl,
        paddingVertical: spacing.md,
        borderRadius: radius.pill,
        backgroundColor: primary ? colors.accent : colors.card,
        borderWidth: primary ? 0 : 1,
        borderColor: colors.line,
        opacity: disabled ? opacity.disabled : pressed ? opacity.pressed : 1,
      })}
    >
      <Text variant="label" tone={primary ? "onAccent" : "ink"}>
        {label}
      </Text>
    </Pressable>
  );
}
