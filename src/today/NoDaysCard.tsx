import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";

import { Button, Text } from "@/components";
import { radius, size, spacing, useColors } from "@/theme";

/** Today when Routines exist but none has days set: a white card pointing the lifter to the Routines tab. */
export function NoDaysCard({ onPlan }: { onPlan: () => void }) {
  const colors = useColors();
  return (
    <View style={{ alignItems: "center", gap: spacing.md, padding: spacing.xl, borderRadius: radius.card, backgroundColor: colors.card }}>
      <View
        style={{
          width: size.heroTile,
          height: size.heroTile,
          borderRadius: radius.inset,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.accentTint,
        }}
      >
        <MaterialCommunityIcons name="calendar-month-outline" size={size.heroIcon} color={colors.accent} />
      </View>
      <Text variant="title">No training days set</Text>
      <Text tone="muted" style={{ textAlign: "center" }}>
        Pick the days you train and Today will plan your week.
      </Text>
      <Button label="Plan your week" icon="calendar-outline" large onPress={onPlan} />
    </View>
  );
}
