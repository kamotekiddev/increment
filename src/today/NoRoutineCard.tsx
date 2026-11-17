import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { View } from "react-native";

import { Button, Text } from "@/components";
import { radius, size, spacing, useColors } from "@/theme";

/** The empty Today: a white card inviting the lifter to build the first Routine. */
export function NoRoutineCard({ onCreate }: { onCreate: () => void }) {
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
        <MaterialCommunityIcons name="dumbbell" size={size.heroIcon} color={colors.accent} />
      </View>
      <Text variant="title">No routine yet</Text>
      <Text tone="muted">Build your own in a minute.</Text>
      <Button label="Create a routine" icon="add" large onPress={onCreate} />
    </View>
  );
}
