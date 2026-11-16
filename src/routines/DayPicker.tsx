import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { fontFamily, minTouch, opacity, radius, spacing, useColors } from "@/theme";

import { DAY_LABELS, isDaySet } from "./routineDays";

export interface DayPickerProps {
  /** Days bitmask, Monday = bit 0. */
  value: number;
  onToggle: (index: number) => void;
  /** Dims the buttons and ignores taps (the routine is locked). */
  disabled?: boolean;
}

/** Seven day buttons, Mon to Sun. Each is at least 44 pt wide and tall. */
export function DayPicker({ value, onToggle, disabled }: DayPickerProps) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", opacity: disabled ? opacity.disabled : 1 }}>
      {DAY_LABELS.map((label, index) => {
        const on = isDaySet(value, index);
        return (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected: on }}
            disabled={disabled}
            onPress={() => onToggle(index)}
            style={{ flex: 1, minWidth: minTouch, minHeight: minTouch, alignItems: "center", justifyContent: "center" }}
          >
            <View
              style={{
                width: minTouch - spacing.sm,
                height: minTouch - spacing.sm,
                borderRadius: radius.pill,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: on ? colors.accent : colors.sunk,
              }}
            >
              <Text
                variant="caption"
                tone={on ? "onAccent" : "soft"}
                style={{ fontFamily: fontFamily.semibold }}
              >
                {label.slice(0, 3)}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
