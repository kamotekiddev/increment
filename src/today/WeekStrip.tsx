import { View } from "react-native";

import { Text } from "@/components";
import { borderWidth, fontFamily, radius, size, spacing, useColors } from "@/theme";

import type { StripDay } from "./todayState";
import { stripLabel } from "./todayText";

/**
 * Seven days, Sunday first, each a day name over a date number. Today is filled with the accent
 * (an accent outline on a rest day); a day with a finished workout is tinted; a dot marks a
 * planned day still to do. Not tappable, and a passed planned day has no "missed" look.
 */
export function WeekStrip({ days, restDay = false }: { days: StripDay[]; restDay?: boolean }) {
  const colors = useColors();
  return (
    <View
      accessibilityLabel="This week"
      style={{ flexDirection: "row", gap: spacing.xs, padding: spacing.sm, borderRadius: radius.inset, backgroundColor: colors.card }}
    >
      {days.map((day) => {
        const filled = day.isToday && !restDay;
        const outlined = day.isToday && restDay;
        const tinted = day.done && !filled;
        const accentText = filled ? "onAccent" : tinted || outlined ? "accent" : "muted";
        return (
          <View
            key={day.label}
            accessible
            accessibilityLabel={stripLabel(day)}
            style={{
              flex: 1,
              alignItems: "center",
              gap: spacing.xs,
              paddingVertical: spacing.md,
              borderRadius: radius.md,
              borderWidth: borderWidth.outline,
              borderColor: outlined ? colors.accent : "transparent",
              backgroundColor: filled ? colors.accent : tinted ? colors.accentTint : "transparent",
            }}
          >
            <Text variant="caption" tone={accentText} style={{ fontFamily: fontFamily.semibold }} numberOfLines={1}>
              {day.label}
            </Text>
            <Text variant="label" tone={filled ? "onAccent" : tinted || outlined ? "accent" : "ink"} style={{ fontFamily: fontFamily.bold }}>
              {day.dayNumber}
            </Text>
            <View
              style={{
                width: size.dot,
                height: size.dot,
                borderRadius: radius.pill,
                backgroundColor: day.planned && !day.done ? (filled ? colors.onAccent : colors.iconFaint) : "transparent",
              }}
            />
          </View>
        );
      })}
    </View>
  );
}
