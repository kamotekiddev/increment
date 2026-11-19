import { Pressable, ScrollView } from "react-native";

import { Text } from "@/components";
import { fontFamily, minTouch, radius, size, spacing, useColors } from "@/theme";

export interface ChipRowProps<T extends string> {
  options: readonly T[];
  /** The one active chip, or null. */
  active: T | null;
  onToggle: (option: T) => void;
  /** Clears the active chip; renders an "All" chip first, active when no chip is. */
  onClear?: () => void;
  /** Spoken label for the row, e.g. "Muscle". */
  label: string;
}

/** Touch padding that lifts the 40 pt chip to the 44 pt minimum target. */
const CHIP_SLOP = (minTouch - size.chip) / 2;

/** Sideways-scrolling single-select chips; the active chip uses the accent fill. */
export function ChipRow<T extends string>({ options, active, onToggle, onClear, label }: ChipRowProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      accessibilityLabel={label}
      contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingVertical: CHIP_SLOP, gap: spacing.sm }}
    >
      {onClear ? <Chip label="All" selected={active === null} onPress={onClear} /> : null}
      {options.map((option) => (
        <Chip key={option} label={option} selected={option === active} onPress={() => onToggle(option)} />
      ))}
    </ScrollView>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      hitSlop={CHIP_SLOP}
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
        {label}
      </Text>
    </Pressable>
  );
}
