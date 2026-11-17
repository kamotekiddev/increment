import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { Text } from "@/components";
import { fontFamily, radius, size, spacing, useColors } from "@/theme";

import type { StripDay } from "./todayState";

/** Seven days, Sunday first. Today is filled; a dot marks a planned day, a check a finished workout. Not tappable. */
export function WeekStrip({ days }: { days: StripDay[] }) {
  const colors = useColors();
  return (
    <View
      accessibilityLabel="This week"
      style={{ flexDirection: "row", gap: spacing.xs, padding: spacing.sm, borderRadius: radius.inset, backgroundColor: colors.card }}
    >
      {days.map((day) => (
        <View
          key={day.label}
          accessible
          accessibilityLabel={`${day.label}${day.isToday ? ", today" : ""}${day.planned ? ", planned" : ""}${day.done ? ", workout done" : ""}`}
          style={{
            flex: 1,
            alignItems: "center",
            gap: spacing.sm,
            paddingVertical: spacing.md,
            borderRadius: radius.md,
            backgroundColor: day.isToday ? colors.accent : "transparent",
          }}
        >
          <Text
            variant="caption"
            tone={day.isToday ? "onAccent" : "muted"}
            style={{ fontFamily: fontFamily.semibold }}
            numberOfLines={1}
          >
            {day.label}
          </Text>
          <View style={{ height: size.check, alignItems: "center", justifyContent: "center" }}>
            {day.done ? (
              <Ionicons name="checkmark-circle" size={size.check} color={day.isToday ? colors.onAccent : colors.accent} />
            ) : day.planned ? (
              <View
                style={{
                  width: size.dot,
                  height: size.dot,
                  borderRadius: radius.pill,
                  backgroundColor: day.isToday ? colors.onAccent : colors.iconFaint,
                }}
              />
            ) : null}
          </View>
        </View>
      ))}
    </View>
  );
}
