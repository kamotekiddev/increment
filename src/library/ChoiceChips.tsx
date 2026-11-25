import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { fontFamily, fontSize, minTouch, radius, size, spacing, useColors } from "@/theme";

export interface ChoiceChipsProps<T extends string> {
  /** The field label above the chips, also spoken for the group. */
  label: string;
  options: readonly { label: string; value: T }[];
  value: T | null;
  onChange: (value: T) => void;
}

/** Touch padding that lifts the 40 pt chip to the 44 pt minimum target. */
const CHIP_SLOP = (minTouch - size.chip) / 2;

/** A wrapping single-choice chip group (New exercise: Main muscle, Equipment). The chosen chip is accent-filled. */
export function ChoiceChips<T extends string>({ label, options, value, onChange }: ChoiceChipsProps<T>) {
  const colors = useColors();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text
        variant="caption"
        tone="muted"
        style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: spacing.xs }}
      >
        {label}
      </Text>
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              hitSlop={CHIP_SLOP}
              onPress={() => onChange(option.value)}
              style={{
                height: size.chip,
                justifyContent: "center",
                paddingHorizontal: spacing.lg,
                borderRadius: radius.pill,
                backgroundColor: selected ? colors.accent : colors.card,
              }}
            >
              <Text
                variant="label"
                tone={selected ? "onAccent" : "soft"}
                style={{ fontFamily: selected ? fontFamily.semibold : fontFamily.medium }}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
