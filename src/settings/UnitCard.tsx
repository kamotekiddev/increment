import Ionicons from "@expo/vector-icons/Ionicons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { Card, Text } from "@/components";
import { fontFamily, fontSize, opacity, radius, size, spacing, useColors } from "@/theme";
import { formatWithUnit } from "@/units";

import { UnitSegmented } from "./UnitSegmented";
import { useJumps } from "./useJumps";
import { useUnit } from "./useUnit";

/**
 * The Units card of Settings: a Kilograms / Pounds control, a note, and the "Smallest weight jump" row
 * (the Barbell Jump) that opens Weight jumps. Choosing a unit saves at once.
 */
export function UnitCard() {
  const colors = useColors();
  const { unit, setUnit } = useUnit();
  const { jumps } = useJumps();
  const barbell = formatWithUnit(jumps.barbell, unit);
  return (
    <View style={{ gap: spacing.sm }}>
      <Text variant="caption" tone="muted" style={{ fontSize: fontSize.small, fontFamily: fontFamily.medium, paddingHorizontal: 6 }}>
        Units
      </Text>
      <Card style={{ borderRadius: radius.card, gap: spacing.md - 2, paddingBottom: 0 }}>
        <UnitSegmented unit={unit} onChange={setUnit} size="wide" track="sunk" />
        <View style={{ flexDirection: "row", gap: spacing.sm }}>
          <Ionicons name="information-circle-outline" size={15} color={colors.inkMuted} style={{ marginTop: 1 }} />
          <Text variant="caption" tone="muted" style={{ flex: 1, lineHeight: 18 }}>
            History, records and charts convert for display. What you logged never changes.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Smallest weight jump, ${barbell}`}
          onPress={() => router.push("/weight-jumps")}
          style={({ pressed }) => ({
            height: size.settingsRow,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.line,
            opacity: pressed ? opacity.pressed : 1,
          })}
        >
          <Text style={{ fontSize: fontSize.body, fontFamily: fontFamily.medium }}>Smallest weight jump</Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text tone="muted" style={{ fontSize: fontSize.label }}>
              {barbell}
            </Text>
            <Ionicons name="chevron-forward" size={16} color={colors.iconFaint} />
          </View>
        </Pressable>
      </Card>
    </View>
  );
}
