import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { Card, Text } from "@/components";
import { fontFamily, fontSize, radius, spacing, useColors } from "@/theme";

import { UnitSegmented } from "./UnitSegmented";
import { useUnit } from "./useUnit";

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
        <UnitSegmented unit={unit} onChange={setUnit} size="wide" track="sunk" />
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
