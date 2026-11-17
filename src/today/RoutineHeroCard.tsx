import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { opacity, radius, size, spacing, useColors } from "@/theme";

import type { TodayCard } from "./todayState";

const CAPTION: Record<TodayCard["status"], string> = { start: "TODAY", done: "FINISHED", inProgress: "RUNNING" };

function exerciseText(count: number): string {
  return `${count} ${count === 1 ? "exercise" : "exercises"}`;
}

/**
 * A Today card. A Routine still to do is an accent "hero" with a white Start pill; Done and In
 * progress are white cards with the name in ink and no button. `fill` stretches it to its parent's
 * height (inside the deck) and pins the Start pill to the bottom.
 */
export function RoutineHeroCard({ card, onStart, fill }: { card: TodayCard; onStart: () => void; fill?: boolean }) {
  const colors = useColors();
  const live = card.status === "start";
  return (
    <View
      style={{
        backgroundColor: live ? colors.accent : colors.card,
        borderRadius: radius.card,
        padding: spacing.xl,
        gap: spacing.lg,
        ...(fill ? { height: "100%", justifyContent: "space-between" } : null),
      }}
    >
      <View style={{ gap: spacing.xs }}>
        <Text variant="caption" tone={live ? "onAccent" : "muted"} style={live ? { opacity: opacity.onAccentSoft } : null}>
          {CAPTION[card.status]}
        </Text>
        <Text variant="heading" tone={live ? "onAccent" : "ink"} numberOfLines={1}>
          {card.name}
        </Text>
        <Text tone={live ? "onAccent" : "muted"} style={live ? { opacity: opacity.onAccentSoft } : null}>
          {exerciseText(card.exerciseCount)}
        </Text>
      </View>
      {live ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Start ${card.name}`}
          onPress={onStart}
          style={({ pressed }) => ({
            backgroundColor: colors.onAccent,
            borderRadius: radius.pill,
            paddingVertical: spacing.md,
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: spacing.sm,
            opacity: pressed ? opacity.pressed : 1,
          })}
        >
          <Ionicons name="play" size={size.icon} color={colors.accent} />
          <Text variant="label" tone="accent">
            Start workout
          </Text>
        </Pressable>
      ) : card.status === "done" ? (
        <View accessible accessibilityLabel="Done" style={{ flexDirection: "row", alignItems: "center", gap: spacing.xs }}>
          <Ionicons name="checkmark-circle" size={size.icon} color={colors.accent} />
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
