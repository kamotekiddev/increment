import { Pressable, ScrollView } from "react-native";

import { Text } from "@/components";
import { minTouch, radius, spacing, useColors } from "@/theme";

export interface ChipRowProps {
  options: string[];
  /** The one active chip, or null. */
  active: string | null;
  onToggle: (option: string) => void;
  /** Spoken label for the row, e.g. "Muscle". */
  label: string;
}

/** Sideways-scrolling single-select chips; the active chip uses the accent style. */
export function ChipRow({ options, active, onToggle, label }: ChipRowProps) {
  const colors = useColors();
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel={label}
      contentContainerStyle={{ paddingHorizontal: spacing.xl, gap: spacing.sm }}
    >
      {options.map((option) => {
        const selected = option === active;
        return (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onToggle(option)}
            style={{
              minHeight: minTouch,
              justifyContent: "center",
              paddingHorizontal: spacing.lg,
              borderRadius: radius.pill,
              borderWidth: 1,
              borderColor: selected ? colors.accent : colors.line,
              backgroundColor: selected ? colors.accent : colors.card,
            }}
          >
            <Text variant="label" tone={selected ? "onAccent" : "ink"}>
              {option}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
