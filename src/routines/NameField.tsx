import { useState } from "react";
import { View } from "react-native";

import { Input, Text } from "@/components";
import { fontFamily, fontSize, radius, size, spacing, useColors } from "@/theme";

export interface NameFieldProps {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  placeholder?: string;
  error: string | null;
  autoFocus?: boolean;
  /** The larger type of New routine (18) or Edit routine (22). */
  inputSize: number;
  /** Spoken label of the field. Defaults to "Routine name". */
  accessibilityLabel?: string;
}

/** The routine name: a label over a white 56 pt field, with an accent ring while focused and an inline error. */
export function NameField({ value, onChangeText, onBlur, onSubmitEditing, placeholder, error, autoFocus, inputSize, accessibilityLabel = "Routine name" }: NameFieldProps) {
  const colors = useColors();
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      <Text variant="caption" tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium }}>
        Name
      </Text>
      <Input
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false);
          onBlur?.();
        }}
        onSubmitEditing={onSubmitEditing}
        placeholder={placeholder}
        accessibilityLabel={accessibilityLabel}
        returnKeyType="done"
        autoFocus={autoFocus}
        style={{
          height: size.control,
          borderRadius: radius.row,
          paddingHorizontal: 18,
          backgroundColor: colors.card,
          fontSize: inputSize,
          borderWidth: 2,
          borderColor: focused ? colors.accent : "transparent",
        }}
      />
      {error ? (
        <Text variant="caption" tone="danger" style={{ paddingHorizontal: spacing.xs }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
