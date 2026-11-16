import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { fontFamily, radius, size, useColors } from "@/theme";

import { DAY_LABELS, isDaySet } from "./routineDays";

export interface DayPickerProps {
  /** Days bitmask, Monday = bit 0. */
  value: number;
  onToggle: (index: number) => void;
}

/** Seven round day buttons, M to S, 46 pt tall. Selected days use the accent fill. */
export function DayPicker({ value, onToggle }: DayPickerProps) {
  const colors = useColors();
  return (
    <View style={{ flexDirection: "row", gap: 6 }}>
      {DAY_LABELS.map((label, index) => {
        const on = isDaySet(value, index);
        return (
          <Pressable
            key={label}
            accessibilityRole="checkbox"
            accessibilityLabel={label}
            accessibilityState={{ checked: on }}
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
              {label[0]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
