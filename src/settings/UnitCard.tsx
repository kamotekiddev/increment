import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { Card, Text } from "@/components";
import { fontFamily, fontSize, radius, size, spacing, useColors } from "@/theme";
import type { Unit } from "@/units";

import { useUnit } from "./useUnit";

const OPTIONS: { unit: Unit; label: string }[] = [
  { unit: "kg", label: "Kilograms" },
  { unit: "lb", label: "Pounds" },
];

/** The Units card of Settings: a Kilograms / Pounds control and a note. Choosing saves at once. */
export function UnitCard() {
  const colors = useColors();
  const { unit, setUnit } = useUnit();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption" tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: 6 }}>
        Units
      </Text>
      <Card style={{ borderRadius: radius.card, gap: spacing.md - 2 }}>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Weight unit"
          style={{ flexDirection: "row", gap: spacing.xs, backgroundColor: colors.sunk, borderRadius: radius.lg, padding: spacing.xs }}
        >
          {OPTIONS.map((o) => {
            const selected = o.unit === unit;
            return (
              <Pressable
                key={o.unit}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setUnit(o.unit)}
                style={{
                  flex: 1,
                  height: size.round - spacing.xs,
                  borderRadius: radius.inset,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: selected ? colors.accent : "transparent",
                }}
              >
                <Text variant="label" tone={selected ? "onAccent" : "muted"} style={{ fontSize: fontSize.body, fontFamily: selected ? fontFamily.semibold : fontFamily.medium }}>
                  {o.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <Ionicons name="information-circle-outline" size={15} color={colors.inkMuted} style={{ marginTop: 1 }} />
          <Text variant="caption" tone="muted" style={{ flex: 1, lineHeight: 18 }}>
            History, records and charts convert for display. What you logged never changes.
          </Text>
        </View>
      </Card>
    </View>
  );
}
