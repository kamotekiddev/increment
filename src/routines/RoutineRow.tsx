import Ionicons from "@expo/vector-icons/Ionicons";
import { Pressable, View } from "react-native";

import { Text } from "@/components";
import { fontSize, opacity, radius, spacing, textStyle, useColors } from "@/theme";

import { routinePreview, routineSubtitle } from "./routineListText";
import type { RoutineListItem } from "./routineQueries";

export interface RoutineRowProps {
  routine: RoutineListItem;
  onPress: () => void;
}

/** A routine card: name, a preview of its exercises, then a footer with days and exercise count. */
export function RoutineRow({ routine, onPress }: RoutineRowProps) {
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
      <Text variant="title" style={textStyle.rowTitle} numberOfLines={1}>
        {routine.name}
      </Text>
      <Text tone="muted" style={{ fontSize: fontSize.meta, lineHeight: 19 }} numberOfLines={2}>
        {routinePreview(routine.exerciseNames, routine.exerciseCount)}
      </Text>
      <View
        style={{
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
