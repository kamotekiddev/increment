import { TextInput, type TextInputProps } from "react-native";

import { fontFamily, fontSize, minTouch, radius, spacing, useColors } from "@/theme";

/** Inset field on the `sunk` colour. */
export function Input({ style, ...rest }: TextInputProps) {
  const colors = useColors();
  return (
    <TextInput
      placeholderTextColor={colors.inkMuted}
      {...rest}
      style={[
        {
          minHeight: minTouch,
          backgroundColor: colors.sunk,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.lg,
          color: colors.ink,
          fontFamily: fontFamily.medium,
          fontSize: fontSize.body,
        },
        style,
      ]}
    />
  );
}
