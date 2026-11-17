import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { fontFamily, opacity, radius, size, useColors } from "@/theme";

import { DAY_LABELS, DISPLAY_ORDER, isDaySet } from "./routineDays";

export interface DayPickerProps {
  /** Days bitmask, Monday = bit 0. */
  value: number;
  onToggle: (index: number) => void;
  /** Dims the buttons and ignores taps (the routine is locked). */
  disabled?: boolean;
}

/** Seven round day buttons, Sunday first (Sun Mon Tue …), 46 pt tall. Selected days use the accent fill. */
export function DayPicker({ value, onToggle, disabled }: DayPickerProps) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", gap: 6, opacity: disabled ? opacity.disabled : 1 }}>
      {DISPLAY_ORDER.map((index) => {
        const label = DAY_LABELS[index];
        const on = isDaySet(value, index);
        return (
          <Pressable
            key={label}
            accessibilityRole="checkbox"
            accessibilityLabel={label}
            accessibilityState={{ checked: on, disabled: !!disabled }}
            disabled={disabled}
            onPress={() => onToggle(index)}
            style={{
              flex: 1,
              height: size.day,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: radius.pill,
              backgroundColor: on ? colors.accent : colors.card,
            }}
          >
            <Text variant="label" tone={on ? "onAccent" : "muted"} style={{ fontFamily: fontFamily.semibold }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
