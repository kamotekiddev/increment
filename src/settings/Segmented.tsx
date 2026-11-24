import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { fontFamily, fontSize, radius, size as sizes, spacing, useColors } from "@/theme";

export interface SegmentedOption<T extends string> {
  value: T;
  /** The option's name: shown on `wide`, and read out on both sizes. */
  label: string;
  /** Shown instead of `label` on `compact` (the "kg | lb" pill). */
  short?: string;
}

/**
 * A radio group drawn as a segmented control: the selected option is an accent pill.
 * `compact` is a small pill; `wide` fills the row. `track` is the colour behind the options.
 */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  size,
  track,
  accessibilityLabel,
}: {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size: "compact" | "wide";
  track: "card" | "sunk";
  accessibilityLabel: string;
}) {
  const colors = useColors();
  const compact = size === "compact";
  return (
    <View
      accessibilityRole="radiogroup"
      accessibilityLabel={accessibilityLabel}
      style={{
        flexDirection: "row",
        backgroundColor: colors[track],
        borderRadius: compact ? radius.pill : radius.lg,
        padding: spacing.xs,
        gap: compact ? 0 : spacing.xs,
      }}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="radio"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            hitSlop={compact ? spacing.xs : undefined}
            onPress={() => onChange(option.value)}
            style={{
              ...(compact ? { width: 46, height: 32 } : { flex: 1, height: sizes.round - spacing.xs }),
              borderRadius: compact ? radius.pill : radius.inset,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: selected ? colors.accent : "transparent",
            }}
          >
            <Text
              variant="label"
              tone={selected ? "onAccent" : "muted"}
              style={{ fontSize: compact ? fontSize.small : fontSize.body, fontFamily: selected ? fontFamily.semibold : fontFamily.medium }}
            >
              {compact ? (option.short ?? option.label) : option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
