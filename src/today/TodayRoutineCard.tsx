import Ionicons from "@expo/vector-icons/Ionicons";
import { View } from "react-native";

import { Button, Text } from "@/components";
import { fontSize, minTouch, radius, spacing, useColors } from "@/theme";

import type { TodayCard } from "./todayState";

/** A compact Today card: the Routine name and, by status, Start, a Done check, or "In progress". */
export function TodayRoutineCard({ card, onStart }: { card: TodayCard; onStart: () => void }) {
  const colors = useColors();
  return (
    <View
      style={{
        minHeight: minTouch + spacing.xl,
        flexDirection: "row",
        alignItems: "center",
        gap: spacing.md,
        paddingVertical: spacing.md,
        paddingLeft: spacing.lg,
        paddingRight: spacing.md,
        borderRadius: radius.card,
        backgroundColor: colors.card,
      }}
    >
      <Text variant="title" style={{ flex: 1, fontSize: fontSize.input, lineHeight: 24, letterSpacing: -0.4 }} numberOfLines={1}>
        {card.name}
      </Text>
      {card.status === "start" ? (
        <Button label="Start" accessibilityLabel={`Start ${card.name}`} onPress={onStart} />
      ) : card.status === "done" ? (
        <View accessible accessibilityLabel="Done" style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
          <Text variant="label" tone="accent">
            Done
          </Text>
        </View>
      ) : (
        <Text variant="label" tone="accent">
          In progress
        </Text>
      )}
    </View>
  );
}
