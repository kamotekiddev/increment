import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { Pill, Text } from "@/components";
import { fontSize, opacity, radius, spacing, textStyle, useColors } from "@/theme";

import { routinePreview, routineSubtitle } from "./routineListText";
import type { RoutineListItem } from "./routineQueries";

const dim = { opacity: opacity.locked };

export interface RoutineRowProps {
  routine: RoutineListItem;
  onPress: () => void;
  /** A Locked routine (free plan, past the 2 oldest): content dimmed, lock icon and Pro tag on the title row. */
  locked?: boolean;
}

/** A routine card: name, a preview of its exercises, then a footer with days and exercise count. */
export function RoutineRow({ routine, onPress, locked = false }: RoutineRowProps) {
  const colors = useColors();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => ({
        gap: 10,
        padding: spacing.lg,
        borderRadius: radius.card,
        backgroundColor: colors.card,
        opacity: pressed ? opacity.pressed : 1,
      })}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }}>
        <Text variant="title" style={[textStyle.rowTitle, { flex: 1 }, locked && dim]} numberOfLines={1}>
          {routine.name}
        </Text>
        {locked ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Ionicons name="lock-closed-outline" size={14} color={colors.inkMuted} />
            <Pill label="Pro" tone="neutral" />
          </View>
        ) : null}
      </View>
      <Text tone="muted" style={[{ fontSize: fontSize.meta, lineHeight: 19 }, locked && dim]} numberOfLines={2}>
        {routinePreview(routine.exerciseNames, routine.exerciseCount)}
      </Text>
      <View
        style={{
          opacity: locked ? opacity.locked : 1,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          paddingTop: 10,
          borderTopWidth: 1,
          borderTopColor: colors.line,
        }}
      >
        <Ionicons name="calendar-outline" size={15} color={colors.inkSoft} />
        <Text tone="soft" style={{ fontSize: fontSize.small }}>
          {routineSubtitle(routine.days, routine.exerciseCount)}
        </Text>
      </View>
    </Pressable>
  );
}
